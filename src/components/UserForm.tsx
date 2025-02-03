import { motion } from 'framer-motion';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useQuestionnaireStore } from '../store/useQuestionnaireStore';
import { supabase } from '../lib/supabase';
import { AlertCircle } from 'lucide-react';

const ROLES = [{value:'web-developer',label:'Desarrollador Web'},{value:'seo',label:'SEO'},{value:'marketing-strategist',label:'Estratega de Marketing'},{value:'intern',label:'Pasante'},{value:'designer',label:'Diseñador'}] as const,
  EXPERIENCE_LEVELS = [{value:'junior',label:'Junior'},{value:'senior',label:'Senior'}] as const,
  GENDERS = [{value:'masculino',label:'Masculino'},{value:'femenino',label:'Femenino'},{value:'prefiero-no-decirlo',label:'Prefiero no decirlo'},{value:'otro',label:'Otro'}] as const,
  CIVIL_STATUS = [{value:'soltero',label:'Soltero/a'},{value:'casado',label:'Casado/a'},{value:'divorciado',label:'Divorciado/a'},{value:'viudo',label:'Viudo/a'},{value:'union-libre',label:'Unión Libre'}] as const,
  EDUCATION_LEVELS = [{value:'secundaria',label:'Secundaria'},{value:'tecnico',label:'Técnico'},{value:'universitario',label:'Universitario'},{value:'postgrado',label:'Postgrado'},{value:'maestria',label:'Maestría'},{value:'doctorado',label:'Doctorado'}] as const,
  selectClass = "mt-1 block w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500";

const TextField = ({id, label, type = 'text', value, onChange, placeholder, ...r}: {id:string; label:string; type?:string; value:string; onChange:React.ChangeEventHandler<HTMLInputElement>; placeholder?:string;}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-neutral-700">{label}</label>
    <Input id={id} type={type} required value={value} onChange={onChange} placeholder={placeholder} className={`mt-1 ${r.className||''}`} />
  </div>
);

const SelectField = ({id, label, value, onChange, options, defaultOption, ...r}: {id:string; label:string; value:string; onChange:React.ChangeEventHandler<HTMLSelectElement>; options:{value:string|number,label:string}[]; defaultOption:string;}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-neutral-700">{label}</label>
    <select id={id} required value={value} onChange={onChange} className={selectClass} {...r}>
      <option value="">{defaultOption}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

export function UserForm() {
  const navigate = useNavigate(), { setUser, setUserId } = useQuestionnaireStore();
  const [formData, setFormData] = useState({
    firstName:'', lastName:'', age:'', gender:'', role:'', experienceLevel:'', email:'', civilStatus:'', dependents:'', educationLevel:'', degree:'', phone:''
  });
  const [error, setError] = useState<string|null>(null), [isSubmitting, setIsSubmitting] = useState(false);
  const handleChange = (f: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) =>
    setFormData(p => ({ ...p, [f]: e.target.value }));
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setIsSubmitting(true);
    try {
      const parts = formData.phone ? formData.phone.split(' ') : ['506',''],
            code = parts[0] || '506',
            number = parts.slice(1).join('');
      const countryCode = '+' + code, phoneNumber = number;
      const { data: user, error: upsertError } = await supabase.from('questionnaire_users')
        .upsert({
          email: formData.email, first_name: formData.firstName, last_name: formData.lastName,
          role: formData.role, experience_level: formData.experienceLevel, age: formData.age,
          gender: formData.gender, civil_status: formData.civilStatus, dependents: formData.dependents,
          education_level: formData.educationLevel, degree: formData.degree,
          country_code: countryCode, phone_number: phoneNumber, completion_time: null
        }, { onConflict:'email' }).select().single();
      if(upsertError) throw upsertError;
      await supabase.from('user_responses').delete().eq('user_id', user.id);
      setUser({ ...formData, countryCode, phoneNumber });
      setUserId(user.id);
      navigate('/questions');
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Ha ocurrido un error inesperado');
    } finally { setIsSubmitting(false); }
  };
  return (
    <div className="min-h-[100dvh] bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[100dvh] flex-col items-center justify-center py-12">
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5}} className="w-full max-w-md space-y-8 px-4 sm:px-0">
            <div>
              <h2 className="text-center text-2xl font-bold text-neutral-900 sm:text-3xl">Antes de comenzar</h2>
              <p className="mt-2 text-center text-sm text-neutral-600">Por favor, completa la siguiente información para continuar</p>
            </div>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400"/>
                  <p className="ml-3 text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <TextField id="firstName" label="Nombre" value={formData.firstName} onChange={handleChange('firstName')}/>
                <TextField id="lastName" label="Apellido" value={formData.lastName} onChange={handleChange('lastName')}/>
              </div>
              <TextField id="email" label="Correo Electrónico" type="email" value={formData.email} onChange={handleChange('email')}/>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-neutral-700">Número de Teléfono</label>
                <div className="mt-1">
                  <PhoneInput country="cr" value={formData.phone} onChange={(v, cd) => {
                    let d = cd.dialCode || '506', n = v.startsWith(d) ? v.slice(d.length) : v;
                    n = n.replace(/\D/g,'');
                    setFormData(p => ({ ...p, phone: d + (n ? ' ' + n : '') }));
                  }} inputProps={{required:true, id:'phone'}} enableSearch searchPlaceholder="Buscar país..." searchNotFound="País no encontrado" preferredCountries={['cr','pa','ni','hn','sv','gt']} containerClass="phone-input-container"/>
                </div>
              </div>
              <TextField id="age" label="Edad" type="number" value={formData.age} onChange={handleChange('age')} min="16" max="100"/>
              <SelectField id="gender" label="¿Con qué género te identificas?" value={formData.gender} onChange={handleChange('gender')} options={GENDERS} defaultOption="Selecciona género"/>
              <SelectField id="civilStatus" label="Estado Civil" value={formData.civilStatus} onChange={handleChange('civilStatus')} options={CIVIL_STATUS} defaultOption="Selecciona estado civil"/>
              <SelectField id="dependents" label="Hijos o dependientes a cargo" value={formData.dependents} onChange={handleChange('dependents')} options={[...[0,1,2,3,4].map(n=>({value:n,label:n.toString()})), {value:'5 o más',label:'5 o más'}]} defaultOption="Selecciona cantidad"/>
              <SelectField id="educationLevel" label="Nivel Educativo" value={formData.educationLevel} onChange={handleChange('educationLevel')} options={EDUCATION_LEVELS} defaultOption="Selecciona nivel educativo"/>
              <TextField id="degree" label="Carrera universitaria y estudios previos" value={formData.degree} onChange={handleChange('degree')} placeholder="Ej: Ingeniería en Sistemas, Diplomado en Marketing"/>
              <SelectField id="role" label="¿Qué puesto estás solicitando?" value={formData.role} onChange={handleChange('role')} options={ROLES} defaultOption="Selecciona un puesto"/>
              {formData.role && <SelectField id="experienceLevel" label="¿Cuál es tu nivel de experiencia en el puesto que solicitas?" value={formData.experienceLevel} onChange={handleChange('experienceLevel')} options={EXPERIENCE_LEVELS} defaultOption="Selecciona nivel de experiencia"/>}
              <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Procesando...' : 'Comenzar'}</Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
