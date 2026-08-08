import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import CustomSelect from './CustomSelect';
import visitService from '../api/visitService';

const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'\-]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;

const pad = (n) => String(n).padStart(2, '0');
const createRequestKey = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const VisitRequestForm = ({ propertyId }) => {
  const today = new Date();
  const minDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState(minDate);
  const [ampm, setAmpm] = useState('AM');
  const [hour, setHour] = useState('9');
  const [minute, setMinute] = useState('00');
  const [message, setMessage] = useState('');
  const [pendingRequest, setPendingRequest] = useState(null);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const amHours = useMemo(() => [7, 8, 9, 10, 11], []);
  const pmHours = useMemo(() => [12, 1, 2, 3, 4, 5, 6, 7, 8], []);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  const validate = (force = false, currentTouched = touched) => {
    const e = {};
    const nameValue = name.trim();
    const phoneValue = phone.trim();
    const emailValue = email.trim();

    const shouldShow = (fieldName) => {
      if (force) return true;
      return Boolean(currentTouched[fieldName]);
    };

    if (shouldShow('name')) {
      if (!nameValue) {
        e.name = 'El nombre es obligatorio.';
      } else if (!nameRegex.test(nameValue)) {
        e.name = 'Ingrese un nombre válido (solo letras).';
      }
    }

    if (shouldShow('phone')) {
      if (!phoneValue) {
        e.phone = 'El teléfono es obligatorio.';
      } else if (!/^[0-9]+$/.test(phoneValue)) {
        e.phone = 'El teléfono debe contener solo números.';
      } else if (phoneValue.length !== 10) {
        e.phone = 'El teléfono debe tener exactamente 10 dígitos.';
      }
    }

    if (shouldShow('email')) {
      if (!emailValue) {
        e.email = 'El correo electrónico es obligatorio.';
      } else if (!emailRegex.test(emailValue)) {
        e.email = 'Correo electrónico inválido.';
      }
    }

    if (shouldShow('date') && date) {
      if (date < minDate) {
        e.date = 'La fecha no puede ser anterior a hoy.';
      }
    }

    const h = Number(hour);
    const m = Number(minute);
    let h24 = h;
    if (ampm === 'AM') {
      if (h === 12) h24 = 0; else h24 = h;
    } else {
      if (h === 12) h24 = 12; else h24 = h + 12;
    }

    const totalMinutes = h24 * 60 + m;
    if (shouldShow('time')) {
      if (totalMinutes < 420 || totalMinutes > 1200) {
        e.time = 'El horario disponible es de 07:00 AM a 08:00 PM.';
      } else if (date === minDate) {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        if (totalMinutes <= currentMinutes) {
          e.time = 'La hora seleccionada ya ha pasado.';
        }
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      validate(false);
    }
  }, [name, phone, email, date, hour, minute, ampm, touched]);

  const handleBlur = (fieldName) => {
    setTouched((current) => {
      const next = { ...current, [fieldName]: true };
      validate(false, next);
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    const allTouched = { name: true, phone: true, email: true, date: true, time: true, message: true };
    setTouched(allTouched);

    if (!validate(true, allTouched)) return;

    const h = Number(hour);
    let h24 = h;
    if (ampm === 'AM') {
      if (h === 12) h24 = 0; else h24 = h;
    } else {
      if (h === 12) h24 = 12; else h24 = h + 12;
    }
    const timeSlot = `${pad(((h24 + 24) % 24))}:${minute} ${ampm}`;

    const localDate = new Date(`${date}T${pad(h24)}:${minute}:00`);
    const preferredDate = localDate.toISOString();
    const requestKey = pendingRequest?.requestKey ?? createRequestKey();
    const payload = {
      propertyId,
      fullName: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      preferredDate,
      timeSlot,
      message: message.trim(),
      requestKey,
    };

    try {
      setSubmitting(true);
      const freshProperty = await api.get(`/api/properties/${propertyId}`);
      const currentState = String(freshProperty?.data?.property?.estado || '').toLowerCase().trim();
      if (currentState !== 'disponible') {
        setErrors((current) => ({ ...current, submit: 'Lo sentimos, esta propiedad ya no se encuentra disponible' }));
        setPendingRequest(payload);
        return;
      }

      await visitService.createVisit(payload);
      setSuccess('Solicitud enviada. Nos contactaremos para confirmar.');
      setPendingRequest(null);
      setName(''); setPhone(''); setEmail(''); setDate(minDate); setHour('9'); setMinute('00'); setAmpm('AM'); setMessage('');
      setTouched({});
      setErrors({});
    } catch (err) {
      setPendingRequest(payload);
      const message = err?.response?.data?.message ?? 'Error enviando la solicitud.';
      setErrors((current) => ({ ...current, submit: message }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = async () => {
    if (!pendingRequest) return;

    try {
      setSubmitting(true);
      const freshProperty = await api.get(`/api/properties/${propertyId}`);
      const currentState = String(freshProperty?.data?.property?.estado || '').toLowerCase().trim();
      if (currentState !== 'disponible') {
        setErrors((current) => ({ ...current, submit: 'Lo sentimos, esta propiedad ya no se encuentra disponible' }));
        return;
      }

      await visitService.createVisit(pendingRequest);
      setSuccess('Solicitud enviada. Nos contactaremos para confirmar.');
      setPendingRequest(null);
      setName(''); setPhone(''); setEmail(''); setDate(minDate); setHour('9'); setMinute('00'); setAmpm('AM'); setMessage('');
      setTouched({});
      setErrors({});
    } catch (err) {
      setErrors((current) => ({ ...current, submit: err?.response?.data?.message ?? 'Error reintentando el envío.' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleFieldChange = (setter, fieldName, value) => {
    setter(value);
    setSuccess('');
    setErrors((current) => {
      const next = { ...current };
      delete next.submit;
      return next;
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <input
            className="w-full h-12 bg-surface-container-low border border-neutral-800 text-white px-4"
            placeholder="Nombre completo"
            value={name}
            onBlur={() => handleBlur('name')}
            onChange={(e) => handleFieldChange(setName, 'name', e.target.value)}
          />
          {errors.name && <div className="text-rose-400 text-sm mt-1">{errors.name}</div>}
        </div>

        <div>
          <input
            className="w-full h-12 bg-surface-container-low border border-neutral-800 text-white px-4"
            placeholder="Ej: 0995706184"
            value={phone}
            maxLength="10"
            onBlur={() => handleBlur('phone')}
            onChange={(e) => handleFieldChange(setPhone, 'phone', e.target.value.replace(/[^0-9]/g, ''))}
          />
          {errors.phone && <div className="text-rose-400 text-sm mt-1">{errors.phone}</div>}
        </div>
      </div>

      <div>
        <input
          className="w-full h-12 bg-surface-container-low border border-neutral-800 text-white px-4"
          placeholder="Correo electrónico"
          value={email}
          onBlur={() => handleBlur('email')}
          onChange={(e) => handleFieldChange(setEmail, 'email', e.target.value)}
        />
        {errors.email && <div className="text-rose-400 text-sm mt-1">{errors.email}</div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm text-neutral-400">Fecha</label>
          <input type="date" min={minDate} value={date} onBlur={() => handleBlur('date')} onChange={(e) => handleFieldChange(setDate, 'date', e.target.value)} className="w-full h-12 bg-surface-container-low border border-neutral-800 text-white px-4 mt-1" />
          {errors.date && <div className="text-rose-400 text-sm mt-1">{errors.date}</div>}
        </div>

        <div>
          <label className="text-sm text-neutral-400">Hora</label>
          <div className="flex gap-2 mt-1">
            <CustomSelect
              value={`${hour}-${ampm}`}
              onChange={(e) => {
                const [hVal, ampmVal] = e.target.value.split('-');
                setHour(hVal);
                setAmpm(ampmVal);
                setSuccess('');
                setErrors((current) => {
                  const next = { ...current };
                  delete next.submit;
                  delete next.time;
                  return next;
                });
                handleBlur('time');
              }}
              className="h-12 border-neutral-800 text-sm"
              options={[
                ...amHours.map((h) => ({ value: `${h}-AM`, label: `${h} AM` })),
                ...pmHours.map((h) => ({ value: `${h}-PM`, label: `${h} PM` }))
              ]}
            />

            <CustomSelect
              value={minute}
              onChange={(e) => {
                handleFieldChange(setMinute, 'time', e.target.value);
                handleBlur('time');
              }}
              className="h-12 border-neutral-800 text-sm"
              options={minutes.map((min) => ({
                value: min.toString().padStart(2, '0'),
                label: min.toString().padStart(2, '0')
              }))}
            />
          </div>
          <p className="text-[11px] text-neutral-500 mt-1.5 uppercase tracking-wider">El horario disponible de visitas es de 7:00 AM a 8:00 PM.</p>
          {errors.time && <div className="text-rose-400 text-sm mt-1">{errors.time}</div>}
        </div>
      </div>

      <div>
        <textarea value={message} onBlur={() => setTouched((current) => ({ ...current, message: true }))} onChange={(e) => handleFieldChange(setMessage, 'message', e.target.value)} className="w-full bg-surface-container-low border border-neutral-800 text-white p-3" rows={4} placeholder="Mensaje o requerimientos" />
      </div>

      {errors.submit && <div className="text-rose-400 text-sm">{errors.submit}</div>}
      {pendingRequest && errors.submit && (
        <button type="button" onClick={handleRetry} className="w-full h-12 border border-neutral-700 text-white uppercase tracking-[0.2em] text-sm">
          Reintentar envío
        </button>
      )}
      {success && <div className="text-emerald-400 text-sm">{success}</div>}

      <div className="pt-2">
        <button className="w-full h-14 bg-primary-container text-black font-h1 text-lg uppercase tracking-[0.2em] hover:brightness-110 transition-all" type="submit" disabled={submitting}>{submitting ? 'Enviando...' : 'SOLICITAR VISITA'}</button>
        <p className="text-center mt-4 text-[10px] text-neutral-600 uppercase tracking-[0.1em]">Al enviar este formulario, usted acepta nuestra política de privacidad para clientes de alto perfil.</p>
      </div>
    </form>
  );
};

export default VisitRequestForm;
