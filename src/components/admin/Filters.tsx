import { Search, SlidersHorizontal, X } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Filters, AdvancedFilters } from './types';
import {
  ROLES,
  EXPERIENCE_LEVELS,
  GENDERS,
  CIVIL_STATUS,
  EDUCATION_LEVELS,
  DEPENDENTS_OPTIONS,
  SCORE_CATEGORIES,
  DESPAIR_LEVELS,
} from './constants';

interface FiltersProps {
  filters: Filters & { countryCode?: string };
  advancedFilters: AdvancedFilters;
  showAdvancedFilters: boolean;
  onFiltersChange: (f: Filters & { countryCode?: string }) => void;
  onAdvancedFiltersChange: (f: AdvancedFilters) => void;
  onToggleAdvancedFilters: () => void;
  onReset: () => void;
  resultsCount: number;
}

export function FiltersSection({
  filters,
  advancedFilters,
  showAdvancedFilters,
  onFiltersChange,
  onAdvancedFiltersChange,
  onToggleAdvancedFilters,
  onReset,
  resultsCount,
}: FiltersProps) {
  const selectClass =
    "mt-1 block w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500";
  const labelClass = "mb-1 block text-sm font-medium text-neutral-700";
  const getPhoneValue = (c: string = '') => c.replace('+', '');
  const updateFilter = (key: keyof (Filters & { countryCode?: string }), val: string) =>
    onFiltersChange({ ...filters, [key]: val });
  const updateAdvFilter = (key: keyof AdvancedFilters, val: string) =>
    onAdvancedFiltersChange({ ...advancedFilters, [key]: val });

  return (
    <div className="mb-4 rounded-lg border border-neutral-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filtros Básicos</h2>
        <Button variant="outline" onClick={onToggleAdvancedFilters} className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          {showAdvancedFilters ? 'Ocultar Filtros Avanzados' : 'Mostrar Filtros Avanzados'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Search */}
        <div>
          <label className={labelClass}>Buscar</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre, email..."
              className="pl-9"
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
            />
          </div>
        </div>

        {/* Country Code */}
        <div>
          <label className={labelClass}>País</label>
          <div className="relative">
            <PhoneInput
              country=""
              value={getPhoneValue(filters.countryCode)}
              onChange={(val) => updateFilter("countryCode", val ? `+${val}` : '')}
              enableSearch
              searchPlaceholder="Buscar país..."
              searchNotFound="País no encontrado"
              containerClass="phone-input-container"
              inputClass="!w-full !pr-8"
              buttonClass="!w-full"
              dropdownClass="!w-full"
            />
            {filters.countryCode && (
              <button
                onClick={() => updateFilter("countryCode", "")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Role */}
        <div>
          <label className={labelClass}>Puesto</label>
          <select value={filters.role} onChange={(e) => updateFilter("role", e.target.value)} className={selectClass}>
            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>

        {/* Experience Level */}
        <div>
          <label className={labelClass}>Nivel de Experiencia</label>
          <select
            value={filters.experienceLevel}
            onChange={(e) => updateFilter("experienceLevel", e.target.value)}
            className={selectClass}
          >
            {EXPERIENCE_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>

        {/* Gender */}
        <div>
          <label className={labelClass}>Género</label>
          <select value={filters.gender} onChange={(e) => updateFilter("gender", e.target.value)} className={selectClass}>
            {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </div>

        {/* Civil Status */}
        <div>
          <label className={labelClass}>Estado Civil</label>
          <select
            value={filters.civilStatus}
            onChange={(e) => updateFilter("civilStatus", e.target.value)}
            className={selectClass}
          >
            {CIVIL_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* Education Level */}
        <div>
          <label className={labelClass}>Nivel Educativo</label>
          <select
            value={filters.educationLevel}
            onChange={(e) => updateFilter("educationLevel", e.target.value)}
            className={selectClass}
          >
            {EDUCATION_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>

        {/* Nuevo: Nivel de Inglés */}
        <div>
          <label className={labelClass}>Nivel de Inglés</label>
          <select
            value={filters.english_level}
            onChange={(e) => updateFilter("english_level", e.target.value)}
            className={selectClass}
          >
            <option value="">Todos</option>
            <option value="cero">Cero</option>
            <option value="bajo">Bajo</option>
            <option value="medio">Medio</option>
            <option value="alto">Alto</option>
            <option value="nativo">Nativo</option>
          </select>
        </div>

        {/* Nuevo: Proficiencia de Inglés */}
        <div>
          <label className={labelClass}>Proficiencia de Inglés</label>
          <select
            value={filters.english_proficiency}
            onChange={(e) => updateFilter("english_proficiency", e.target.value)}
            className={selectClass}
          >
            <option value="">Todos</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="C1">C1</option>
            <option value="C2">C2</option>
          </select>
        </div>

        {/* Despair Level */}
        <div>
          <label className={labelClass}>Nivel de Desesperación</label>
          <select
            value={filters.despairLevel}
            onChange={(e) => updateFilter("despairLevel", e.target.value)}
            className={selectClass}
          >
            {DESPAIR_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
      </div>

      {showAdvancedFilters && (
        <div className="mt-6 border-t border-neutral-200 pt-6">
          <h3 className="mb-4 text-lg font-semibold">Filtros Avanzados</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Age Range */}
            <div>
              <label className={labelClass}>Rango de Edad</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Mín"
                  value={advancedFilters.minAge}
                  onChange={(e) => updateAdvFilter("minAge", e.target.value)}
                  min="16"
                  max="100"
                />
                <span className="text-neutral-500">-</span>
                <Input
                  type="number"
                  placeholder="Máx"
                  value={advancedFilters.maxAge}
                  onChange={(e) => updateAdvFilter("maxAge", e.target.value)}
                  min="16"
                  max="100"
                />
              </div>
            </div>

            {/* Score Category */}
            <div>
              <label className={labelClass}>Categoría de Puntuación</label>
              <select
                value={advancedFilters.scoreCategory}
                onChange={(e) => updateAdvFilter("scoreCategory", e.target.value)}
                className={selectClass}
              >
                {SCORE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            {/* Score Range */}
            <div>
              <label className={labelClass}>Rango de Puntuación (%)</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Mín"
                  value={advancedFilters.minScore}
                  onChange={(e) => updateAdvFilter("minScore", e.target.value)}
                  min="0"
                  max="100"
                />
                <span className="text-neutral-500">-</span>
                <Input
                  type="number"
                  placeholder="Máx"
                  value={advancedFilters.maxScore}
                  onChange={(e) => updateAdvFilter("maxScore", e.target.value)}
                  min="0"
                  max="100"
                />
              </div>
            </div>

            {/* Dependents */}
            <div>
              <label className={labelClass}>Dependientes</label>
              <select
                value={advancedFilters.dependents}
                onChange={(e) => updateAdvFilter("dependents", e.target.value)}
                className={selectClass}
              >
                {DEPENDENTS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className={labelClass}>Fecha de Registro</label>
              <div className="flex items-center gap-2">
                <Input type="date" value={advancedFilters.dateFrom} onChange={(e) => updateAdvFilter("dateFrom", e.target.value)} />
                <span className="text-neutral-500">-</span>
                <Input type="date" value={advancedFilters.dateTo} onChange={(e) => updateAdvFilter("dateTo", e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        <Button variant="outline" onClick={onReset}>Limpiar Todos los Filtros</Button>
        <p className="text-sm text-neutral-600">
          {resultsCount} {resultsCount === 1 ? 'resultado' : 'resultados'}
        </p>
      </div>
    </div>
  );
}
