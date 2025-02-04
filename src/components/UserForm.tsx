import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useQuestionnaireStore } from '../store/useQuestionnaireStore';
import { supabase } from '../lib/supabase';
import { AlertCircle, Upload } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const ROLES = [
  { value: 'web-developer', label: 'Desarrollador Web' },
  { value: 'seo', label: 'SEO' },
  { value: 'marketing-strategist', label: 'Estratega de Marketing' },
  { value: 'intern', label: 'Pasante' },
  { value: 'designer', label: 'Diseñador' }
] as const;

const EXPERIENCE_LEVELS = [
  { value: 'junior', label: 'Junior' },
  { value: 'senior', label: 'Senior' }
] as const;

const GENDERS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'prefiero-no-decirlo', label: 'Prefiero no decirlo' },
  { value: 'otro', label: 'Otro' }
] as const;

const CIVIL_STATUS = [
  { value: 'soltero', label: 'Soltero/a' },
  { value: 'casado', label: 'Casado/a' },
  { value: 'divorciado', label: 'Divorciado/a' },
  { value: 'viudo', label: 'Viudo/a' },
  { value: 'union-libre', label: 'Unión Libre' }
] as const;

const EDUCATION_LEVELS = [
  { value: 'secundaria', label: 'Secundaria' },
  { value: 'tecnico', label: 'Técnico' },
  { value: 'universitario', label: 'Universitario' },
  { value: 'postgrado', label: 'Postgrado' },
  { value: 'maestria', label: 'Maestría' },
  { value: 'doctorado', label: 'Doctorado' }
] as const;

const LANGUAGES = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' },
  { value: 'pt', label: 'Português' },
  { value: 'ru', label: 'Русский' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'ar', label: 'العربية' },
  { value: 'hi', label: 'हिन्दी' },
  { value: 'other', label: 'Otro' }
] as const;

const ENGLISH_LEVEL_OPTIONS = [
  { value: 'cero', label: 'Cero' },
  { value: 'bajo', label: 'Bajo' },
  { value: 'medio', label: 'Medio' },
  { value: 'alto', label: 'Alto' },
  { value: 'nativo', label: 'Nativo' }
] as const;

const DETAILED_ENGLISH_LEVEL_OPTIONS = [
  { value: 'A1', label: 'A1' },
  { value: 'A2', label: 'A2' },
  { value: 'B1', label: 'B1' },
  { value: 'B2', label: 'B2' },
  { value: 'C1', label: 'C1' },
  { value: 'C2', label: 'C2' }
] as const;

const selectClass =
  "mt-1 block w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500";

const TextField = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  ...r
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-neutral-700">
      {label}
    </label>
    <Input
      id={id}
      type={type}
      required
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`mt-1 ${r.className || ''}`}
    />
  </div>
);

const SelectField = ({
  id,
  label,
  value,
  onChange,
  options,
  defaultOption,
  ...r
}: {
  id: string;
  label: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  options: { value: string | number; label: string }[];
  defaultOption: string;
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-neutral-700">
      {label}
    </label>
    <select id={id} required value={value} onChange={onChange} className={selectClass} {...r}>
      <option value="">{defaultOption}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

export function UserForm() {
  const navigate = useNavigate();
  const { setUser, setUserId } = useQuestionnaireStore();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formTouched, setFormTouched] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    role: '',
    experienceLevel: '',
    email: '',
    civilStatus: '',
    dependents: '',
    educationLevel: '',
    degree: '',
    phone: '',
    englishLevel: '',
    englishProficiency: '',
    nativeLanguage: '',
    expectedSalaryUsd: '',
    hourlyRateUsd: '0',
    dailyAvailabilityHours: '8',
    weekendAvailability: 'false',
    weekendHours: '0',
    immediateAvailability: 'false',
    internetSpeedMbps: ''
  });

  const handleChange = (f: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) =>
    setFormData((prev) => {
      if (!formTouched) setFormTouched(true);
      return { ...prev, [f]: e.target.value };
    });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setError('El archivo es demasiado grande. El tamaño máximo es 5MB.');
        return;
      }
      if (
        ![
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ].includes(file.type)
      ) {
        setError('Por favor sube un archivo PDF o Word (.doc, .docx)');
        return;
      }
      setCvFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formTouched) return;
    if (!cvFile) {
      setError('Por favor sube tu curriculum');
      return;
    }
    setIsSubmitting(true);
    try {
      const parts = formData.phone ? formData.phone.split(' ') : ['506', ''],
        code = parts[0] || '506',
        number = parts.slice(1).join('');
      const countryCode = '+' + code,
        phoneNumber = number;

      // First create the user record without CV
      const { data: user, error: upsertError } = await supabase
        .from('questionnaire_users')
        .upsert(
          {
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: formData.role,
            experience_level: formData.experienceLevel,
            age: formData.age,
            gender: formData.gender,
            civil_status: formData.civilStatus,
            dependents: formData.dependents,
            education_level: formData.educationLevel,
            degree: formData.degree,
            country_code: countryCode,
            phone_number: phoneNumber,
            native_language: formData.nativeLanguage,
            expected_salary_usd: formData.expectedSalaryUsd ? parseFloat(formData.expectedSalaryUsd) : null,
            hourly_rate_usd: formData.hourlyRateUsd ? parseFloat(formData.hourlyRateUsd) : null,
            daily_availability_hours: formData.dailyAvailabilityHours ? parseInt(formData.dailyAvailabilityHours) : null,
            weekend_availability: formData.weekendAvailability === 'true',
            weekend_hours: formData.weekendHours ? parseInt(formData.weekendHours) : null,
            immediate_availability: formData.immediateAvailability === 'true',
            internet_speed_mbps: formData.internetSpeedMbps ? parseInt(formData.internetSpeedMbps) : null,
            completion_time: 0 // Set completion time to 0 since we're skipping questions
          },
          { onConflict: 'email' }
        )
        .select()
        .single();

      if (upsertError) throw upsertError;

      // Then upload CV to private storage
      const cvFileName = `${user.id}/${Date.now()}-${cvFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('private')
        .upload(cvFileName, cvFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Update user record with CV path
      const { error: updateError } = await supabase
        .from('questionnaire_users')
        .update({ cv_file_path: cvFileName })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setUser({ ...formData, countryCode, phoneNumber });
      setUserId(user.id);

      // Show completion modal directly
      navigate('/questions', { state: { showCompletionDirectly: true } });
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Ha ocurrido un error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[100dvh] flex-col items-center justify-center py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md space-y-8 px-4 sm:px-0"
          >
            <div>
              <h2 className="text-center text-2xl font-bold text-neutral-900 sm:text-3xl">
                Antes de comenzar
              </h2>
              <p className="mt-2 text-center text-sm text-neutral-600">
                Por favor, completa la siguiente información para continuar
              </p>
            </div>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <p className="ml-3 text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <TextField
                  id="firstName"
                  label="Nombre"
                  value={formData.firstName}
                  onChange={handleChange('firstName')}
                />
                <TextField
                  id="lastName"
                  label="Apellido"
                  value={formData.lastName}
                  onChange={handleChange('lastName')}
                />
              </div>
              <TextField
                id="email"
                label="Correo Electrónico"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
              />
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-neutral-700">
                  Número de Teléfono
                </label>
                <div className="mt-1">
                  <PhoneInput
                    country="cr"
                    value={formData.phone}
                    onChange={(v, cd) => {
                      let d = cd.dialCode || '506',
                        n = v.startsWith(d) ? v.slice(d.length) : v;
                      n = n.replace(/\D/g, '');
                      setFormData((p) => ({ ...p, phone: d + (n ? ' ' + n : '') }));
                    }}
                    inputProps={{ required: true, id: 'phone' }}
                    enableSearch
                    searchPlaceholder="Buscar país..."
                    searchNotFound="País no encontrado"
                    preferredCountries={['cr', 'pa', 'ni', 'hn', 'sv', 'gt']}
                    containerClass="phone-input-container"
                  />
                </div>
              </div>
              <TextField
                id="age"
                label="Edad"
                type="number"
                value={formData.age}
                onChange={handleChange('age')}
                min="16"
                max="100"
              />
              <SelectField
                id="gender"
                label="¿Con qué género te identificas?"
                value={formData.gender}
                onChange={handleChange('gender')}
                options={GENDERS}
                defaultOption="Selecciona género"
              />
              <SelectField
                id="civilStatus"
                label="Estado Civil"
                value={formData.civilStatus}
                onChange={handleChange('civilStatus')}
                options={CIVIL_STATUS}
                defaultOption="Selecciona estado civil"
              />
              <SelectField
                id="dependents"
                label="Hijos o dependientes a cargo"
                value={formData.dependents}
                onChange={handleChange('dependents')}
                options={[
                  ...[0, 1, 2, 3, 4].map((n) => ({ value: n, label: n.toString() })),
                  { value: '5 o más', label: '5 o más' }
                ]}
                defaultOption="Selecciona cantidad"
              />
              <SelectField
                id="educationLevel"
                label="Nivel Educativo"
                value={formData.educationLevel}
                onChange={handleChange('educationLevel')}
                options={EDUCATION_LEVELS}
                defaultOption="Selecciona nivel educativo"
              />
              <TextField
                id="degree"
                label="Carrera universitaria y estudios previos"
                value={formData.degree}
                onChange={handleChange('degree')}
                placeholder="Ej: Ingeniería en Sistemas, Diplomado en Marketing"
              />
              <SelectField
                id="englishLevel"
                label="Nivel de Inglés"
                value={formData.englishLevel}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((p) => ({
                    ...p,
                    englishLevel: val,
                    englishProficiency: val === 'cero' ? '' : p.englishProficiency
                  }));
                }}
                options={ENGLISH_LEVEL_OPTIONS}
                defaultOption="Selecciona nivel de inglés"
              />
              {formData.englishLevel && formData.englishLevel !== 'cero' && (
                <div className="mt-4">
                  <p className="text-sm text-neutral-600 mb-1">
                    Si no conoces tu nivel,{' '}
                    <a
                      href="https://www.efset.org/4-skill/launch/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      toma este Examen
                    </a>
                    .
                  </p>
                  <SelectField
                    id="englishProficiency"
                    label="Si sabes tu nivel de inglés, introduce aquí:"
                    value={formData.englishProficiency}
                    onChange={handleChange('englishProficiency')}
                    options={DETAILED_ENGLISH_LEVEL_OPTIONS}
                    defaultOption="Selecciona tu nivel detallado"
                  />
                </div>
              )}
              <SelectField
                id="role"
                label="¿Qué puesto estás solicitando?"
                value={formData.role}
                onChange={handleChange('role')}
                options={ROLES}
                defaultOption="Selecciona un puesto"
              />
              {formData.role && (
                <SelectField
                  id="experienceLevel"
                  label="¿Cuál es tu nivel de experiencia en el puesto que solicitas?"
                  value={formData.experienceLevel}
                  onChange={handleChange('experienceLevel')}
                  options={EXPERIENCE_LEVELS}
                  defaultOption="Selecciona nivel de experiencia"
                />
              )}
              <SelectField
                id="nativeLanguage"
                label="Idioma Nativo"
                value={formData.nativeLanguage}
                onChange={handleChange('nativeLanguage')}
                options={LANGUAGES}
                defaultOption="Selecciona tu idioma nativo"
              />
              <div>
                <label htmlFor="expectedSalaryUsd" className="block text-sm font-medium text-neutral-700">
                  Salario Mensual Esperado (USD)
                </label>
                <Input
                  id="expectedSalaryUsd"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.expectedSalaryUsd}
                  onChange={handleChange('expectedSalaryUsd')}
                  placeholder="Ejemplo - 1000"
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="hourlyRateUsd" className="block text-sm font-medium text-neutral-700">
                  Tarifa por Hora (USD)
                </label>
                <Input
                  id="hourlyRateUsd"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.hourlyRateUsd}
                  onChange={handleChange('hourlyRateUsd')}
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="dailyAvailabilityHours" className="block text-sm font-medium text-neutral-700">
                  Horas Disponibles por Día
                </label>
                <Input
                  id="dailyAvailabilityHours"
                  type="number"
                  min="1"
                  max="24"
                  step="1"
                  value={formData.dailyAvailabilityHours}
                  onChange={handleChange('dailyAvailabilityHours')}
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="weekendAvailability" className="block text-sm font-medium text-neutral-700">
                  ¿Puedes Trabajar los Fines de Semana?
                </label>
                <select
                  id="weekendAvailability"
                  value={formData.weekendAvailability}
                  onChange={handleChange('weekendAvailability')}
                  className={selectClass}
                >
                  <option value="false">No</option>
                  <option value="true">Sí</option>
                </select>
              </div>
              {formData.weekendAvailability === 'true' && (
                <div>
                  <label htmlFor="weekendHours" className="block text-sm font-medium text-neutral-700">
                    Horas Disponibles en Fin de Semana
                  </label>
                  <Input
                    id="weekendHours"
                    type="number"
                    min="0"
                    max="24"
                    step="1"
                    value={formData.weekendHours}
                    onChange={handleChange('weekendHours')}
                    className="mt-1"
                  />
                </div>
              )}
              <div>
                <label htmlFor="immediateAvailability" className="block text-sm font-medium text-neutral-700">
                  ¿Estás Disponible para Comenzar Inmediatamente?
                </label>
                <select
                  id="immediateAvailability"
                  value={formData.immediateAvailability}
                  onChange={handleChange('immediateAvailability')}
                  className={selectClass}
                >
                  <option value="false">No</option>
                  <option value="true">Sí</option>
                </select>
              </div>
              <div>
                <label htmlFor="internetSpeedMbps" className="block text-sm font-medium text-neutral-700">
                  Velocidad de Internet (Mbps)
                </label>
                <Input
                  id="internetSpeedMbps"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.internetSpeedMbps}
                  onChange={handleChange('internetSpeedMbps')}
                  placeholder="Ej: 100"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Curriculum Vitae (PDF o Word)
                </label>
                <div className="mt-1 flex items-center justify-center">
                  <label className="relative flex w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-white p-6 hover:border-neutral-400">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-neutral-400" />
                      <div className="flex text-sm text-neutral-600">
                        <span className="relative rounded-md font-medium text-blue-600 hover:text-blue-500">
                          {cvFile ? cvFile.name : 'Subir archivo'}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500">PDF o Word hasta 5MB</p>
                    </div>
                    {/* Removed `required` from the file input to prevent browser validation
                        from trying to focus a hidden input. Validation is handled in handleSubmit. */}
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Procesando...
                  </span>
                ) : (
                  'Comenzar'
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
