const mongoose = require('mongoose');
const Property = require('../models/Property');
const { getBucket, initFirebaseAdmin } = require('../firebaseAdmin');
const { getPropertyOwnerId } = require('../middleware/authorizeProperty');

const normalizeText = (value) => String(value ?? '').trim();

const parseOptionalNumber = (value) => {
    if (value === '' || value === null || value === undefined) {
        return undefined;
    }

    const numericValue = Number(value);

    return Number.isFinite(numericValue) ? numericValue : Number.NaN;
};

const parseOptionalBoolean = (value) => {
    if (value === true || value === false) {
        return value;
    }

    if (value === 'true' || value === '1' || value === 1) {
        return true;
    }

    if (value === 'false' || value === '0' || value === 0) {
        return false;
    }

    return undefined;
};

const buildCharacteristics = (caracteristicas = {}) => {
    const nextCharacteristics = {};

    if (caracteristicas.habitaciones !== undefined && caracteristicas.habitaciones !== '') {
        const habitaciones = parseOptionalNumber(caracteristicas.habitaciones);

        if (!Number.isFinite(habitaciones)) {
            return { error: 'Las habitaciones deben ser un número válido.' };
        }

        nextCharacteristics.habitaciones = habitaciones;
    }

    if (caracteristicas.banos !== undefined && caracteristicas.banos !== '') {
        const banos = parseOptionalNumber(caracteristicas.banos);

        if (!Number.isFinite(banos)) {
            return { error: 'Los baños deben ser un número válido.' };
        }

        nextCharacteristics.banos = banos;
    }

    if (caracteristicas.areaMetros !== undefined && caracteristicas.areaMetros !== '') {
        const areaMetros = parseOptionalNumber(caracteristicas.areaMetros);

        if (!Number.isFinite(areaMetros)) {
            return { error: 'El área debe ser un número válido.' };
        }

        nextCharacteristics.areaMetros = areaMetros;
    }

    if (caracteristicas.parqueadero !== undefined) {
        const parqueadero = parseOptionalBoolean(caracteristicas.parqueadero);

        if (parqueadero === undefined) {
            return { error: 'El parqueadero debe ser verdadero o falso.' };
        }

        nextCharacteristics.parqueadero = parqueadero;
    }

    return { value: nextCharacteristics };
};

const parsePrice = (value) => {
    if (value === '' || value === null || value === undefined) {
        return Number.NaN;
    }

    return Number(value);
};

const canManageProperty = (userRole) => {
    const role = normalizeText(userRole).toLowerCase();

    return role === 'agente' || role === 'admin';
};

const buildPropertyFilter = (req) => {
    const role = normalizeText(req.user?.role).toLowerCase();

    if (!req.user?.id) {
        return {};
    }

    if (role === 'admin') {
        return {};
    }

    return {
        $or: [
            { createdBy: req.user.id },
            { agente: req.user.id }
        ]
    };
};

const listProperties = async (req, res) => {
    try {
        const properties = await Property.find(buildPropertyFilter(req))
            .populate('agente', 'name email role')
            .populate('createdBy', 'name email role')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'Propiedades obtenidas correctamente.',
            total: properties.length,
            properties
        });
    } catch (error) {
        return res.status(500).json({ message: 'No se pudieron obtener las propiedades.' });
    }
};

const getPropertyById = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) return res.status(400).json({ message: 'Property id is required.' });

        const property = await Property.findById(id)
            .populate('agente', 'name email role')
            .populate('createdBy', 'name email role');

        if (!property) return res.status(404).json({ message: 'Propiedad no encontrada.' });

        return res.status(200).json({ message: 'Propiedad obtenida.', property });
    } catch (err) {
        console.error('Error getPropertyById', err);
        return res.status(500).json({ message: 'Error obteniendo la propiedad.' });
    }
};

const createProperty = async (req, res) => {
    try {
        if (!canManageProperty(req.user?.role)) {
            return res.status(403).json({ message: 'No tienes permisos para registrar propiedades.' });
        }

        const { titulo, precio, ubicacion, tipo, modalidad, descripcion, imagenes, caracteristicas } = req.body;
        const normalizedTitle = normalizeText(titulo);
        const normalizedType = normalizeText(tipo);
        const normalizedModality = normalizeText(modalidad);
        const normalizedDescription = normalizeText(descripcion);
        const normalizedLocation = normalizeText(ubicacion);
        const numericPrice = parsePrice(precio);
        const normalizedImages = Array.isArray(imagenes)
            ? imagenes.map((image) => normalizeText(image)).filter(Boolean)
            : [];
        const parsedCharacteristics = buildCharacteristics(caracteristicas || {});

        if (parsedCharacteristics.error) {
            return res.status(400).json({ message: parsedCharacteristics.error });
        }

        if (!normalizedTitle || !normalizedLocation || !normalizedType || !normalizedDescription || !normalizedModality) {
            return res.status(400).json({ message: 'Título, precio, ubicación, tipo, modalidad y descripción son obligatorios.' });
        }

        if (!Number.isFinite(numericPrice)) {
            return res.status(400).json({ message: 'El precio debe ser un número válido.' });
        }

        if (numericPrice < 0) {
            return res.status(400).json({ message: 'El precio no puede ser negativo.' });
        }

        const allowedTypes = ['Casa', 'Departamento', 'Terreno', 'Oficina'];

        if (!allowedTypes.includes(normalizedType)) {
            return res.status(400).json({ message: 'El tipo de propiedad no es válido.' });
        }

        if (!['Venta', 'Alquiler'].includes(normalizedModality)) {
            return res.status(400).json({ message: 'La modalidad de la propiedad no es válida.' });
        }

        const property = await Property.create({
            titulo: normalizedTitle,
            precio: numericPrice,
            ubicacion: {
                direccion: normalizedLocation,
                ciudad: 'Quito'
            },
            tipo: normalizedType,
            modalidad: normalizedModality,
            descripcion: normalizedDescription,
            agente: req.user.id,
            createdBy: req.user.id,
            imagenes: normalizedImages,
            caracteristicas: parsedCharacteristics.value,
        });

        const populatedProperty = await Property.findById(property._id)
            .populate('agente', 'name email role')
            .populate('createdBy', 'name email role');

        return res.status(201).json({
            message: 'Propiedad registrada correctamente.',
            property: populatedProperty
        });
    } catch (error) {
        return res.status(500).json({ message: 'No se pudo registrar la propiedad.' });
    }
};

const listMyProperties = async (req, res) => {
    try {
        const properties = await Property.find({
            $or: [
                { createdBy: req.user.id },
                { agente: req.user.id }
            ]
        })
            .populate('agente', 'name email role')
            .populate('createdBy', 'name email role')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'Mis propiedades obtenidas correctamente.',
            total: properties.length,
            properties
        });
    } catch (error) {
        return res.status(500).json({ message: 'No se pudieron obtener tus propiedades.' });
    }
};

const updateProperty = async (req, res) => {
    try {
        const property = req.property;

        const { titulo, precio, ubicacion, tipo, modalidad, descripcion, estado, imagenes, caracteristicas } = req.body;

        if (titulo !== undefined) {
            const nextTitle = normalizeText(titulo);

            if (!nextTitle) {
                return res.status(400).json({ message: 'El título no puede estar vacío.' });
            }

            property.titulo = nextTitle;
        }

        if (precio !== undefined) {
            const nextPrice = parsePrice(precio);

            if (!Number.isFinite(nextPrice)) {
                return res.status(400).json({ message: 'El precio debe ser un número válido.' });
            }

            if (nextPrice < 0) {
                return res.status(400).json({ message: 'El precio no puede ser negativo.' });
            }

            property.precio = nextPrice;
        }

        if (ubicacion !== undefined) {
            const nextLocation = normalizeText(ubicacion);

            if (!nextLocation) {
                return res.status(400).json({ message: 'La ubicación no puede estar vacía.' });
            }

            const currentLocation = property.ubicacion?.toObject ? property.ubicacion.toObject() : (property.ubicacion || {});

            property.ubicacion = {
                ...currentLocation,
                direccion: nextLocation
            };
        }

        if (tipo !== undefined) {
            const nextType = normalizeText(tipo);

            if (!['Casa', 'Departamento', 'Terreno', 'Oficina'].includes(nextType)) {
                return res.status(400).json({ message: 'El tipo de propiedad no es válido.' });
            }

            property.tipo = nextType;
        }

        if (modalidad !== undefined) {
            const nextModality = normalizeText(modalidad);

            if (!['Venta', 'Alquiler'].includes(nextModality)) {
                return res.status(400).json({ message: 'La modalidad de la propiedad no es válida.' });
            }

            property.modalidad = nextModality;
        }

        if (descripcion !== undefined) {
            const nextDescription = normalizeText(descripcion);

            if (!nextDescription) {
                return res.status(400).json({ message: 'La descripción no puede estar vacía.' });
            }

            property.descripcion = nextDescription;
        }

        if (estado !== undefined) {
            if (!['Disponible', 'Vendida', 'Alquilada'].includes(estado)) {
                return res.status(400).json({ message: 'El estado de la propiedad no es válido.' });
            }

            property.estado = estado;
        }

        if (imagenes !== undefined) {
            if (!Array.isArray(imagenes)) {
                return res.status(400).json({ message: 'Las imágenes deben enviarse como una lista.' });
            }

            property.imagenes = imagenes.map((image) => normalizeText(image)).filter(Boolean);
        }

        if (caracteristicas !== undefined) {
            const parsedCharacteristics = buildCharacteristics(caracteristicas || {});

            if (parsedCharacteristics.error) {
                return res.status(400).json({ message: parsedCharacteristics.error });
            }

            property.caracteristicas = parsedCharacteristics.value;
        }

        if (!property.createdBy) {
            property.set('createdBy', property.agente || req.user.id);
        }

        await property.save();

        const updatedProperty = await Property.findById(property._id)
            .populate('agente', 'name email role')
            .populate('createdBy', 'name email role');

        return res.status(200).json({
            message: 'Propiedad actualizada correctamente.',
            property: updatedProperty
        });
    } catch (error) {
        console.error('Error updating property:', error);
        if (error?.name === 'ValidationError') {
            return res.status(400).json({
                message: 'No se pudo actualizar la propiedad.',
                details: Object.values(error.errors || {}).map((item) => item.message)
            });
        }

        return res.status(500).json({ message: 'No se pudo actualizar la propiedad.' });
    }
};

const deleteProperty = async (req, res) => {
    try {
        const property = req.property;

        const paths = Array.isArray(property.storagePaths) ? property.storagePaths.slice() : [];
        const bucket = getBucket();
        const deleteResults = [];

        if (!bucket && paths.length > 0) {
            for (const p of paths) {
                deleteResults.push({ path: p, deleted: false, error: 'Firebase Admin not configured on server' });
            }
        }

        if (bucket && paths.length > 0) {
            for (const p of paths) {
                try {
                    await bucket.file(p).delete();
                    deleteResults.push({ path: p, deleted: true });
                } catch (err) {
                    console.error('Failed to delete storage object during property delete', p, err.message || err);
                    deleteResults.push({ path: p, deleted: false, error: err.message || String(err) });
                }
            }
        }

        await Property.deleteOne({ _id: property._id });

        return res.status(200).json({
            message: 'Propiedad eliminada correctamente.',
            propertyId: property._id,
            storage: deleteResults
        });
    } catch (error) {
        return res.status(500).json({ message: 'No se pudo eliminar la propiedad.' });
    }
};

const addPropertyMedia = async (req, res) => {
    try {
        const property = req.property;
        const mediaUrl = normalizeText(req.body?.mediaUrl);

        if (!mediaUrl) {
            return res.status(400).json({ message: 'La URL del archivo multimedia es obligatoria.' });
        }

        let parsedUrl;

        try {
            parsedUrl = new URL(mediaUrl);
        } catch (error) {
            return res.status(400).json({ message: 'La URL del archivo multimedia no es válida.' });
        }

        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            return res.status(400).json({ message: 'La URL del archivo multimedia no es válida.' });
        }

        const currentMedia = Array.isArray(property.mediaUrls) ? property.mediaUrls : [];
        const currentImages = Array.isArray(property.imagenes) ? property.imagenes : [];
        const currentPaths = Array.isArray(property.storagePaths) ? property.storagePaths : [];

        const storagePathFromBody = normalizeText(req.body?.storagePath);
        const storagePath = storagePathFromBody || extractStoragePathFromUrl(mediaUrl);

        if (!currentMedia.includes(mediaUrl)) {
            property.mediaUrls = [...currentMedia, mediaUrl];
        }

        if (!currentImages.includes(mediaUrl)) {
            property.imagenes = [...currentImages, mediaUrl];
        }

        if (storagePath) {
            if (!currentPaths.includes(storagePath)) {
                property.storagePaths = [...currentPaths, storagePath];
            }
        }

        if (!property.createdBy) {
            property.set('createdBy', property.agente || req.user.id);
        }

        await property.save();

        const updatedProperty = await Property.findById(property._id)
            .populate('agente', 'name email role')
            .populate('createdBy', 'name email role');

        return res.status(200).json({
            message: 'Multimedia agregada correctamente.',
            property: updatedProperty
        });
    } catch (error) {
        return res.status(500).json({ message: 'No se pudo guardar la multimedia de la propiedad.' });
    }
};

const extractStoragePathFromUrl = (url) => {
    if (!url) return null;

    try {
        const u = new URL(url);
        if (u.hostname === 'firebasestorage.googleapis.com') {
            const parts = u.pathname.split('/');
            const oIndex = parts.indexOf('o');
            if (oIndex !== -1 && parts[oIndex + 1]) {
                return decodeURIComponent(parts.slice(oIndex + 1).join('/'));
            }
        }
        if (u.hostname === 'storage.googleapis.com') {
            const parts = u.pathname.split('/').filter(Boolean);
            if (parts.length >= 2) {
                return parts.slice(1).join('/');
            }
        }

        const m = u.hostname.match(/^(.*?)\.storage\.googleapis\.com$/);
        if (m) {
            const parts = u.pathname.split('/').filter(Boolean);
            return parts.join('/');
        }

        if (u.protocol === 'gs:') {
            const parts = u.pathname.split('/').filter(Boolean);
            return parts.join('/');
        }

        return null;
    } catch (e) {
        return null;
    }
};
    const removePropertyMedia = async (req, res) => {
        try {
            const property = req.property;

            let mediaUrls = [];

            if (Array.isArray(req.body?.mediaUrls) && req.body.mediaUrls.length > 0) {
                mediaUrls = req.body.mediaUrls.map((u) => normalizeText(u)).filter(Boolean);
            } else if (req.body?.mediaUrl) {
                mediaUrls = [normalizeText(req.body.mediaUrl)];
            } else if (req.query?.mediaUrl) {
                mediaUrls = [normalizeText(req.query.mediaUrl)];
            }

            if (!mediaUrls || mediaUrls.length === 0) {
                return res.status(400).json({ message: 'La URL del archivo multimedia es obligatoria.' });
            }

          
            mediaUrls = [...new Set(mediaUrls)];

            const pathsToDelete = [];
            const currentPaths = Array.isArray(property.storagePaths) ? property.storagePaths : [];

            mediaUrls.forEach((u) => {
                const idx = (property.mediaUrls || []).indexOf(u);
                if (idx !== -1 && currentPaths[idx]) {
                    pathsToDelete.push(currentPaths[idx]);
                    return;
                }

                const p = extractStoragePathFromUrl(u);
                if (p) {
                    pathsToDelete.push(p);
                    return;
                }

                try {
                    const nameFromUrl = (() => {
                        const parsed = new URL(u);
                        const parts = parsed.pathname.split('/').filter(Boolean);
                        return decodeURIComponent(parts[parts.length - 1] || '');
                    })();

                    const match = currentPaths.find((cp) => cp.endsWith(nameFromUrl));
                    if (match) {
                        pathsToDelete.push(match);
                    }
                } catch (e) {
                    
                }
            });
            if (Array.isArray(property.mediaUrls)) {
                property.mediaUrls = property.mediaUrls.filter((u) => !mediaUrls.includes(u));
            }

            if (Array.isArray(property.imagenes)) {
                property.imagenes = property.imagenes.filter((u) => !mediaUrls.includes(u));
            }

            if (Array.isArray(property.storagePaths) && pathsToDelete.length > 0) {
                property.storagePaths = property.storagePaths.filter((p) => !pathsToDelete.includes(p));
            }

            const bucket = getBucket();
            const deleteResults = [];

            if (!bucket && pathsToDelete.length > 0) {
                // Inform client that physical deletion could not be attempted due to missing server config
                for (const p of pathsToDelete) {
                    deleteResults.push({ path: p, deleted: false, error: 'Firebase Admin not configured on server' });
                }
            }

            if (bucket && pathsToDelete.length > 0) {
                for (const objectPath of pathsToDelete) {
                    try {
                        await bucket.file(objectPath).delete();
                        deleteResults.push({ path: objectPath, deleted: true });
                    } catch (err) {
                        console.error('Failed to delete storage object', objectPath, err.message || err);
                        deleteResults.push({ path: objectPath, deleted: false, error: err.message || String(err) });
                    }
                }
            }

            await property.save();

            const updatedProperty = await Property.findById(property._id)
                .populate('agente', 'name email role')
                .populate('createdBy', 'name email role');

            return res.status(200).json({ message: 'Multimedia eliminada correctamente.', property: updatedProperty, storage: deleteResults });
        } catch (error) {
            console.error('Error removing property media:', error);
            return res.status(500).json({ message: 'No se pudo eliminar la multimedia de la propiedad.' });
        }
    };

    module.exports = {
        createProperty,
        listProperties,
        listMyProperties,
        updateProperty,
        deleteProperty,
        addPropertyMedia,
        removePropertyMedia,
        getPropertyById,
    };