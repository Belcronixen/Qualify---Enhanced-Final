import { type } from "os";

export const ROLES = [
  { value: '', label: 'Todos los roles' },
  { value: 'web-developer', label: 'Desarrollador Web' },
  { value: 'seo', label: 'SEO' },
  { value: 'marketing-strategist', label: 'Estratega de Marketing' },
  { value: 'intern', label: 'Pasante' },
  { value: 'designer', label: 'Diseñador' },
] as const;

export const EXPERIENCE_LEVELS = [
  { value: '', label: 'Toda experiencia' },
  { value: 'junior', label: 'Junior' },
  { value: 'senior', label: 'Senior' },
] as const;

export const GENDERS = [
  { value: '', label: 'Todos los géneros' },
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'prefiero-no-decirlo', label: 'Prefiero no decirlo' },
  { value: 'otro', label: 'Otro' },
] as const;

export const CIVIL_STATUS = [
  { value: '', label: 'Todos los estados' },
  { value: 'soltero', label: 'Soltero/a' },
  { value: 'casado', label: 'Casado/a' },
  { value: 'divorciado', label: 'Divorciado/a' },
  { value: 'viudo', label: 'Viudo/a' },
  { value: 'union-libre', label: 'Unión Libre' },
] as const;

export const EDUCATION_LEVELS = [
  { value: '', label: 'Todos los niveles' },
  { value: 'secundaria', label: 'Secundaria' },
  { value: 'tecnico', label: 'Técnico' },
  { value: 'universitario', label: 'Universitario' },
  { value: 'postgrado', label: 'Postgrado' },
  { value: 'maestria', label: 'Maestría' },
  { value: 'doctorado', label: 'Doctorado' },
] as const;

export const DEPENDENTS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: '0', label: '0' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5 o más', label: '5 o más' },
] as const;

export const SCORE_CATEGORIES = [
  { value: '', label: 'Todas las categorías' },
  { value: 'Competencia Tecnológica Básica', label: 'Competencia Tecnológica Básica' },
  { value: 'Resolución de Problemas y Pensamiento Crítico', label: 'Resolución de Problemas y Pensamiento Crítico' },
  { value: 'Estado Personal y Recursos', label: 'Estado Personal y Recursos' },
] as const;

export const DESPAIR_LEVELS = [
  { value: '', label: 'Todos los niveles' },
  { value: 'none', label: 'Sin Desesperación' },
  { value: 'low', label: 'Desesperación Baja' },
  { value: 'medium', label: 'Desesperación Media' },
  { value: 'high', label: 'Desesperación Alta' },
] as const;
