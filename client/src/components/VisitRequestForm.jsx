import { useMemo, useState } from 'react';
import visitService from '../api/visitService';

const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'\-]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;

const pad = (n) => String(n).padStart(2, '0');

const VisitRequestForm = ({ propertyId }) => {
  const today = new Date();
  const minDate = today.toISOString().slice(0, 10); 

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState(minDate);
  const [ampm, setAmpm] = useState('AM');
  const [hour, setHour] = useState('9');
  const [minute, setMinute] = useState('00');
  const [message, setMessage] = useState('');

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const amHours = useMemo(() => [7, 8, 9, 10, 11], []);
  const pmHours = useMemo(() => [12, 1, 2, 3, 4, 5, 6, 7, 8], []);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  const validate = () => {
    const e = {};
    if (!name || !nameRegex.test(name.trim())) e.name = 'Ingrese un nombre válido (solo letras).';
    if (!phone || !phoneRegex.test(phone.trim())) e.phone = 'Teléfono inválido. Sólo números.';
    if (!email || !emailRegex.test(email.trim())) e.email = 'Correo electrónico inválido.';
    if (!date) e.date = 'Seleccione una fecha.';
    else if (date < minDate) e.date = 'La fecha no puede ser anterior a hoy.';
    if (!phone || phone.trim().length !== 10) {
      e.phone = 'El teléfono debe tener exactamente 10 dígitos.';
    }

    const h = Number(hour);
    let h24 = h;
    if (ampm === 'AM') {
      if (h === 12) h24 = 0; else h24 = h;
    } else {
      if (h === 12) h24 = 12; else h24 = h + 12;
    }

    if (h24 < 7 || h24 > 20) e.time = 'El horario disponible es de 07:00 AM a 08:00 PM.';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    if (!validate()) return;

    const h = Number(hour);
    let h24 = h;
    if (ampm === 'AM') {
      if (h === 12) h24 = 0; else h24 = h;
    } else {
      if (h === 12) h24 = 12; else h24 = h + 12;
    }
    const timeSlot = `${pad(((h24 + 24) % 24))}:${minute} ${ampm}`;

    const preferredDate = `${date}T${pad(h24)}:${minute}:00.000Z`;

    try {
      setSubmitting(true);
      await visitService.createVisit({
        propertyId,
        fullName: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        preferredDate,
        timeSlot,
        message: message.trim(),
      });
      setSuccess('Solicitud enviada. Nos contactaremos para confirmar.');
      setName(''); setPhone(''); setEmail(''); setDate(minDate); setHour('9'); setMinute('00'); setAmpm('AM'); setMessage('');
    } catch (err) {
      setErrors({ submit: err?.response?.data?.message ?? 'Error enviando la solicitud.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <input
            className="w-full h-12 bg-surface-container-low border border-neutral-800 text-white px-4"
            placeholder="Nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <div className="text-rose-400 text-sm mt-1">{errors.name}</div>}
        </div>

        <div>
          <input
            className="w-full h-12 bg-surface-container-low border border-neutral-800 text-white px-4"
            placeholder="Ej: 0995706184"
            value={phone}
            maxLength="10"
            onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
          />
          {errors.phone && <div className="text-rose-400 text-sm mt-1">{errors.phone}</div>}
        </div>
      </div>

      <div>
        <input
          className="w-full h-12 bg-surface-container-low border border-neutral-800 text-white px-4"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email && <div className="text-rose-400 text-sm mt-1">{errors.email}</div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm text-neutral-400">Fecha</label>
          <input type="date" min={minDate} value={date} onChange={(e) => setDate(e.target.value)} className="w-full h-12 bg-surface-container-low border border-neutral-800 text-white px-4 mt-1" />
          {errors.date && <div className="text-rose-400 text-sm mt-1">{errors.date}</div>}
        </div>

        <div>
          <label className="text-sm text-neutral-400">Hora</label>
          <div className="flex gap-2 mt-1">
            <select value={hour} onChange={(e) => setHour(e.target.value)} className="h-12 bg-surface-container-low border border-neutral-800 text-white px-3">
              <optgroup label="AM">
                {amHours.map((h) => <option key={`am-${h}`} value={String(h)}>{h}</option>)}
              </optgroup>
              <optgroup label="PM">
                {pmHours.map((h) => <option key={`pm-${h}`} value={String(h)}>{h}</option>)}
              </optgroup>
            </select>

            <select
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              className="bg-neutral-800 text-white p-2 rounded"
            >
              {minutes.map((min) => (
                <option key={min} value={min.toString().padStart(2, '0')}>
                  {min.toString().padStart(2, '0')}
                </option>
              ))}
            </select>

            <select value={ampm} onChange={(e) => setAmpm(e.target.value)} className="h-12 bg-surface-container-low border border-neutral-800 text-white px-3">
              <option>AM</option>
              <option>PM</option>
            </select>
          </div>
          {errors.time && <div className="text-rose-400 text-sm mt-1">{errors.time}</div>}
        </div>
      </div>

      <div>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="w-full bg-surface-container-low border border-neutral-800 text-white p-3" rows={4} placeholder="Mensaje o requerimientos" />
      </div>

      {errors.submit && <div className="text-rose-400 text-sm">{errors.submit}</div>}
      {success && <div className="text-emerald-400 text-sm">{success}</div>}

      <div className="pt-2">
        <button className="w-full h-14 bg-primary-container text-black font-h1 text-lg uppercase tracking-[0.2em] hover:brightness-110 transition-all" type="submit" disabled={submitting}>{submitting ? 'Enviando...' : 'SOLICITAR VISITA'}</button>
        <p className="text-center mt-4 text-[10px] text-neutral-600 uppercase tracking-[0.1em]">Al enviar este formulario, usted acepta nuestra política de privacidad para clientes de alto perfil.</p>
      </div>
    </form>
  );
};

export default VisitRequestForm;
