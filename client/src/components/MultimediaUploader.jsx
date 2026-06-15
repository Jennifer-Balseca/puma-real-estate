import { useMemo, useRef, useState, useEffect } from 'react';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import api from '../api/axios';
import { isFirebaseConfigured, storage } from '../firebase';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'video/mp4'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'mp4'];

const MultimediaUploader = ({ propertyId, onUploaded }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFileName, setCurrentFileName] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const uploadTaskRef = useRef(null);

  const previewFiles = useMemo(() => files.map((file) => ({
    name: file.name,
    size: file.size,
    type: file.type,
  })), [files]);

  const [propertySlug, setPropertySlug] = useState('');
  const [propertyFetchError, setPropertyFetchError] = useState(false);

  useEffect(() => {
    if (!propertyId) return;

    let cancelled = false;

    const fetchProp = async () => {
      try {
        const resp = await api.get(`/api/properties/${propertyId}`);
        if (cancelled) return;
        const title = resp.data?.property?.titulo || '';
        const slug = title
          .toString()
          .trim()
          .toLowerCase()
          .normalize('NFKD')
          .replace(/\p{Diacritic}/gu, '')
          .replace(/[^a-z0-9 -]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');

        if (slug) setPropertySlug(slug);
      } catch (e) {
        console.warn('No se pudo obtener la propiedad para slug:', e?.response?.data || e.message || e);
        setPropertyFetchError(true);
      }
    };

    void fetchProp();

    return () => { cancelled = true; };
  }, [propertyId]);

  const resetMessages = () => {
    setError('');
    setSuccessMessage('');
  };

  const validateFile = (file) => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    if (!ALLOWED_MIME_TYPES.includes(file.type) || !ALLOWED_EXTENSIONS.includes(extension)) {
      return 'Solo se permiten imágenes JPG/PNG o videos MP4.';
    }

    if (file.size > MAX_FILE_SIZE) {
      return 'Cada archivo debe pesar como máximo 5 MB.';
    }

    return '';
  };

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    resetMessages();

    if (!selectedFiles.length) {
      setFiles([]);
      return;
    }

    const invalidFile = selectedFiles.find((file) => validateFile(file));

    if (invalidFile) {
      setFiles([]);
      setError(validateFile(invalidFile));
      event.target.value = '';
      return;
    }

    setFiles(selectedFiles);
  };

  const uploadSingleFile = (file) => new Promise((resolve, reject) => {
    if (!storage) {
      reject(new Error('Firebase no está configurado todavía.'));
      return;
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const folder = propertySlug ? `${propertySlug}-${propertyId}` : propertyId;
    const storagePath = `properties/${folder}/${Date.now()}-${safeName}`;
    const storageRef = ref(storage, storagePath);
    const task = uploadBytesResumable(storageRef, file);

    uploadTaskRef.current = task;
    setCurrentFileName(file.name);
    console.info('Iniciando carga a Firebase:', file.name, file.size, file.type);

    const stallTimer = setTimeout(() => {
      if (progress === 0) {
        console.warn('Carga sin avance después de 20s — posible CORS o bloqueo de red');
        setError('La carga no avanza (0%). Revisa la consola y la pestaña Network por CORS o bloqueo.');
      }
    }, 20000);
    task.on('state_changed', (snapshot) => {
      try {
        const currentProgress = snapshot.totalBytes > 0
          ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          : 0;

        if (currentProgress > 0) {
          clearTimeout(stallTimer);
        }

        setProgress(currentProgress);
        console.debug('Upload snapshot', {
          state: snapshot.state,
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
          progress: currentProgress,
        });
      } catch (err) {
        console.error('Error reading upload snapshot', err, snapshot);
      }
    }, (uploadError) => {
      clearTimeout(stallTimer);
      console.error('Firebase upload error:', uploadError);
      setError(`${uploadError?.code || 'upload_error'}: ${uploadError?.message || String(uploadError)}`);
      reject(uploadError);
    }, async () => {
      try {
        clearTimeout(stallTimer);
        const downloadUrl = await getDownloadURL(task.snapshot.ref);
        try {
          await api.post(`/api/properties/${propertyId}/media`, { mediaUrl: downloadUrl, storagePath });
        } catch (backendErr) {
          console.error('Backend association failed:', backendErr);
          setError('La carga se completó pero no se pudo guardar en el servidor: ' + (backendErr.response?.data?.message || backendErr.message || backendErr));
        }

        console.info('Carga finalizada, URL:', downloadUrl);
        resolve(downloadUrl);
      } catch (finalErr) {
        console.error('Error finalizando la carga (getDownloadURL or backend):', finalErr);
        setError(finalErr?.message || String(finalErr));
        reject(finalErr);
      }
    });
  });

  const handleUpload = async () => {
    if (!propertyId) {
      setError('Primero guarda la propiedad para habilitar la carga multimedia.');
      return;
    }

    if (!isFirebaseConfigured || !storage) {
      setError('Configura Firebase en el archivo .env del cliente antes de subir archivos.');
      return;
    }

    if (files.length === 0) {
      setError('Selecciona al menos un archivo multimedia.');
      return;
    }

    setUploading(true);
    resetMessages();

    if (propertyFetchError) {
      setError('No se pudo obtener la información de la propiedad; la carga requiere la propiedad guardada.');
      setUploading(false);
      return;
    }

    if (!propertySlug) {
      // Not ideal, but allow upload; folder will use propertyId only.
      console.warn('Property slug not available — storage folder will use propertyId only.');
    }

    try {
      for (const file of files) {
        const uploadedUrl = await uploadSingleFile(file);

        if (typeof onUploaded === 'function') {
          onUploaded(uploadedUrl);
        }
      }

      setSuccessMessage('Multimedia subida correctamente.');
      setFiles([]);
      setProgress(100);
      setCurrentFileName('');
    } catch (uploadError) {
      if (uploadError?.code === 'storage/canceled') {
        setError('La carga fue cancelada.');
      } else {
        setError(uploadError.response?.data?.message || uploadError.message || 'No se pudo subir la multimedia.');
      }
    } finally {
      setUploading(false);
      uploadTaskRef.current = null;
    }
  };

  const handleCancel = () => {
    if (uploadTaskRef.current) {
      uploadTaskRef.current.cancel();
    }
  };

  return (
    <div className="space-y-4 border border-neutral-800 bg-[#111111] p-5">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-white">Subir multimedia</h3>
        <p className="text-sm text-[#C0C0C0]">
          Agrega imágenes JPG/PNG o videos MP4 con un peso máximo de 5 MB por archivo.
        </p>
      </div>

      <input
        type="file"
        accept="image/jpeg,image/png,video/mp4"
        multiple
        onChange={handleFileChange}
        className="block w-full text-sm text-[#C0C0C0] file:mr-4 file:h-12 file:border-0 file:bg-[#D4AF37] file:px-4 file:text-sm file:font-semibold file:uppercase file:tracking-[0.2em] file:text-black hover:file:brightness-110"
      />

      {previewFiles.length > 0 ? (
        <div className="space-y-2 border border-neutral-800 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37]">Archivos seleccionados</p>
          <ul className="space-y-1 text-sm text-[#C0C0C0]">
            {previewFiles.map((file) => (
              <li key={`${file.name}-${file.size}`} className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-1 last:border-b-0 last:pb-0">
                <span>{file.name}</span>
                <span>{Math.round(file.size / 1024)} KB</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {uploading ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-[#C0C0C0]">
            <span>Subiendo {currentFileName || 'archivo'}...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden bg-neutral-800">
            <div className="h-full bg-[#D4AF37] transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : null}

      {error ? <p className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}
      {successMessage ? <p className="border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{successMessage}</p> : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          className="h-12 flex-1 bg-[#D4AF37] px-6 text-sm font-semibold uppercase tracking-[0.2em] text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {uploading ? 'Subiendo...' : 'Subir archivos'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={!uploading}
          className="h-12 border border-neutral-700 px-6 text-sm uppercase tracking-[0.2em] text-[#C0C0C0] transition hover:border-[#D4AF37] hover:text-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default MultimediaUploader;