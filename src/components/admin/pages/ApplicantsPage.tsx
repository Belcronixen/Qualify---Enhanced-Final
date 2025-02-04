import { useState, useEffect, useCallback } from 'react';
import { useUsers } from "../useUsers";
import { useResponses } from "../useResponses";
import { UserCard } from "../UserCard";
import { FiltersSection } from "../Filters";
import { Filters, AdvancedFilters, QuestionnaireUser } from "../types";
import { motion } from 'framer-motion';
import { Users, Filter, Search, X, Download } from 'lucide-react';
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";

// Country codes to names mapping
const COUNTRY_NAMES: { [key: string]: string } = {
  '+1': 'United States/Canada',
  '+44': 'United Kingdom',
  '+506': 'Costa Rica',
  '+507': 'Panama',
  '+503': 'El Salvador',
  '+502': 'Guatemala',
  '+504': 'Honduras',
  '+505': 'Nicaragua',
  '+51': 'Peru',
  '+52': 'Mexico',
  '+54': 'Argentina',
  '+55': 'Brazil',
  '+56': 'Chile',
  '+57': 'Colombia',
  '+58': 'Venezuela',
  '+593': 'Ecuador',
  '+595': 'Paraguay',
  '+598': 'Uruguay',
  '+34': 'Spain',
};

function downloadCSV(users: QuestionnaireUser[]) {
  // Define headers
  const headers = [
    'First Name',
    'Last Name',
    'Email',
    'Country Code',
    'Country Name',
    'Phone Number',
    'Age',
    'Role',
    'Experience Level',
    'Sign Up Date',
    'Completion Time (minutes)',
    'Expected Salary (USD)',
    'Lower Salary Acceptance',
    'Dependents',
    'English Level',
    'English Proficiency',
    'Native Language',
    'Despair Level',
    'Logic Score',
    'Technology Score',
    'Hourly Rate (USD)',
    'Daily Hours Available',
    'Weekend Availability',
    'Weekend Hours',
    'Immediate Availability'
  ];

  // Transform data
  const rows = users.map(user => {
    // Find the lower salary acceptance response
    const lowerSalaryResponse = user.responses?.find(r => 
      r.question?.question_text?.toLowerCase().includes('aceptar un salario menor')
    );

    // Get category scores
    const logicScore = user.categoryScores?.['Resolución de Problemas y Pensamiento Crítico']?.percentage || 0;
    const techScore = user.categoryScores?.['Competencia Tecnológica Básica']?.percentage || 0;

    // Get country name from code
    const countryName = COUNTRY_NAMES[user.country_code] || 'Unknown';

    // Calculate completion time in minutes
    const completionTimeMinutes = user.completion_time 
      ? Math.round(user.completion_time / 60) 
      : 'N/A';

    return [
      user.first_name,
      user.last_name,
      user.email,
      user.country_code,
      countryName,
      user.phone_number,
      user.age,
      user.role,
      user.experience_level,
      new Date(user.created_at).toLocaleDateString(),
      completionTimeMinutes,
      user.expected_salary_usd || 'N/A',
      lowerSalaryResponse?.response_text || 'N/A',
      user.dependents,
      user.english_level,
      user.english_proficiency || 'N/A',
      user.native_language,
      user.despairLevel?.level || 'N/A',
      `${logicScore.toFixed(2)}%`,
      `${techScore.toFixed(2)}%`,
      user.hourly_rate_usd || 'N/A',
      user.daily_availability_hours || 'N/A',
      user.weekend_availability ? 'Yes' : 'No',
      user.weekend_hours || 'N/A',
      user.immediate_availability ? 'Yes' : 'No'
    ];
  });

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => 
      typeof cell === 'string' && cell.includes(',') 
        ? `"${cell}"` 
        : cell
    ).join(','))
  ].join('\n');

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `applicants_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function ApplicantsPage() {
  const { users, filteredUsers, setFilteredUsers, deleteUser, updateUserScore, loading, error } = useUsers();
  const { userResponses, expandedUser, toggleUserExpansion } = useResponses();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<Filters>({
    search: '',
    role: '',
    experienceLevel: '',
    gender: '',
    civilStatus: '',
    educationLevel: '',
    countryCode: '',
    despairLevel: '',
    english_level: '',
    english_proficiency: '',
  });
  
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    minAge: '',
    maxAge: '',
    minScore: '',
    maxScore: '',
    dependents: '',
    dateFrom: '',
    dateTo: '',
    scoreCategory: '',
  });

  const filterUsers = useCallback(
    (users: QuestionnaireUser[]) => {
      return users.filter((user) => {
        if (quickSearch) {
          const qs = quickSearch.toLowerCase();
          if (
            !user.first_name.toLowerCase().includes(qs) &&
            !user.last_name.toLowerCase().includes(qs) &&
            !user.email.toLowerCase().includes(qs) &&
            !user.degree.toLowerCase().includes(qs)
          )
            return false;
        }
        const s = filters.search.toLowerCase();
        const mSearch =
          user.first_name.toLowerCase().includes(s) ||
          user.last_name.toLowerCase().includes(s) ||
          user.email.toLowerCase().includes(s) ||
          user.degree.toLowerCase().includes(s);
        const mRole = !filters.role || user.role === filters.role;
        const mExp = !filters.experienceLevel || user.experience_level === filters.experienceLevel;
        const mGen = !filters.gender || user.gender === filters.gender;
        const mCiv = !filters.civilStatus || user.civil_status === filters.civilStatus;
        const mEdu = !filters.educationLevel || user.education_level === filters.educationLevel;
        const mCountry = !filters.countryCode || user.country_code === filters.countryCode;
        const mDespair = !filters.despairLevel || (user.despairLevel && user.despairLevel.level === filters.despairLevel);
        const mEnglishLevel = !filters.english_level || user.english_level === filters.english_level;
        const mEnglishProficiency = !filters.english_proficiency || user.english_proficiency === filters.english_proficiency;
        const age = parseInt(user.age) || 0;
        const mMinAge = !advancedFilters.minAge || age >= parseInt(advancedFilters.minAge);
        const mMaxAge = !advancedFilters.maxAge || age <= parseInt(advancedFilters.maxAge);
        const mDep = !advancedFilters.dependents || user.dependents === advancedFilters.dependents;
        const uDate = new Date(user.created_at);
        const mDateFrom = !advancedFilters.dateFrom || uDate >= new Date(advancedFilters.dateFrom);
        const mDateTo = !advancedFilters.dateTo || uDate <= new Date(advancedFilters.dateTo);
        const mScoreCat =
          !advancedFilters.scoreCategory ||
          (user.categoryScores?.[advancedFilters.scoreCategory] &&
            (!advancedFilters.minScore ||
              user.categoryScores[advancedFilters.scoreCategory].percentage >= parseFloat(advancedFilters.minScore)) &&
            (!advancedFilters.maxScore ||
              user.categoryScores[advancedFilters.scoreCategory].percentage <= parseFloat(advancedFilters.maxScore)));
        return (
          mSearch &&
          mRole &&
          mExp &&
          mGen &&
          mCiv &&
          mEdu &&
          mCountry &&
          mDespair &&
          mEnglishLevel &&
          mEnglishProficiency &&
          mMinAge &&
          mMaxAge &&
          mDep &&
          mDateFrom &&
          mDateTo &&
          mScoreCat
        );
      });
    },
    [filters, advancedFilters, quickSearch]
  );

  useEffect(() => {
    setFilteredUsers(filterUsers(users));
  }, [users, filterUsers, setFilteredUsers]);

  const resetAllFilters = () => {
    setQuickSearch('');
    setFilters({
      search: '',
      role: '',
      experienceLevel: '',
      gender: '',
      civilStatus: '',
      educationLevel: '',
      countryCode: '',
      despairLevel: '',
      english_level: '',
      english_proficiency: '',
    });
    setAdvancedFilters({
      minAge: '',
      maxAge: '',
      minScore: '',
      maxScore: '',
      dependents: '',
      dateFrom: '',
      dateTo: '',
      scoreCategory: '',
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="text-lg text-gray-700">Cargando aplicantes...</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-xl border border-red-300 bg-red-100 p-6 text-center text-red-700">
        Error: {error}
      </div>
    );
  }

  const hasActiveFilters =
    Object.values(filters).some(Boolean) ||
    Object.values(advancedFilters).some(Boolean) ||
    quickSearch;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Aplicantes</h1>
          <p className="mt-1 text-sm text-gray-600">
            {filteredUsers.length} {filteredUsers.length === 1 ? 'aplicante' : 'aplicantes'} encontrados
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => downloadCSV(filteredUsers)}
            className="flex items-center gap-2 border border-gray-300 bg-white text-gray-800 hover:bg-gray-100"
          >
            <Download className="h-4 w-4" /> Exportar CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 border border-gray-300 bg-white text-gray-800 hover:bg-gray-100"
          >
            <Filter className="h-4 w-4" /> Filtros
          </Button>
        </div>
      </div>
      <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              type="text"
              placeholder="Buscar por nombre, email..."
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              className="border border-gray-300 bg-white pl-9 text-gray-900 placeholder:text-gray-500"
            />
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={resetAllFilters}
              className="flex items-center gap-2 text-red-600 hover:bg-red-100"
            >
              <X className="h-4 w-4" /> Limpiar Filtros
            </Button>
          )}
        </div>
        <motion.div
          initial={false}
          animate={{ height: showFilters ? 'auto' : 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          {showFilters && (
            <div className="mt-4 border-t border-gray-300 pt-4">
              <FiltersSection
                filters={filters}
                advancedFilters={advancedFilters}
                showAdvancedFilters={showAdvancedFilters}
                onFiltersChange={setFilters}
                onAdvancedFiltersChange={setAdvancedFilters}
                onToggleAdvancedFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
                onReset={resetAllFilters}
                resultsCount={filteredUsers.length}
              />
            </div>
          )}
        </motion.div>
      </div>
      {filteredUsers.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-gray-300 bg-white p-8 text-center shadow-lg">
          <Users className="mb-4 h-12 w-12 text-gray-500" />
          <p className="text-lg font-medium text-gray-900">No se encontraron aplicantes</p>
          <p className="mt-1 text-sm text-gray-600">Intenta ajustar los filtros de búsqueda</p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={resetAllFilters}
              className="mt-4 border border-gray-300 bg-white text-gray-800 hover:bg-gray-100"
            >
              Limpiar Filtros
            </Button>
          )}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              responses={userResponses[user.id] || []}
              isExpanded={expandedUser === user.id}
              onToggle={() => toggleUserExpansion(user.id)}
              loading={!userResponses[user.id]}
              onScoreUpdate={updateUserScore}
              onDelete={deleteUser}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}