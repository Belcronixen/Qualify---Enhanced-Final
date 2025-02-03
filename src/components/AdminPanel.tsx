import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers } from './admin/useUsers';
import { useResponses } from './admin/useResponses';
import { UserCard } from './admin/UserCard';
import { FiltersSection } from './admin/Filters';
import { DashboardSummary } from './admin/DashboardSummary';
import { ScoringControls } from './admin/ScoringControls';
import { AdminSettings } from './admin/AdminSettings';
import { CollapsibleSection } from './admin/CollapsibleSection';
import { Filters, AdvancedFilters } from './admin/types';
import { supabase } from '../lib/supabase';

function AdminPanel() {
  const navigate = useNavigate();
  const { users, filteredUsers, setFilteredUsers, loading, error, updateUserScore } = useUsers();
  const { userResponses, expandedUser, toggleUserExpansion } = useResponses();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    search: '', role: '', experienceLevel: '', gender: '', civilStatus: '',
    educationLevel: '', countryCode: '', despairLevel: ''
  });
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    minAge: '', maxAge: '', minScore: '', maxScore: '', dependents: '',
    dateFrom: '', dateTo: '', scoreCategory: ''
  });

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.user_metadata?.role !== 'admin') navigate('/');
      setAuthChecking(false);
    })();
  }, [navigate]);

  useEffect(() => {
    const s = filters.search.toLowerCase();
    const filt = users.filter(u => {
      const mSearch =
        u.first_name.toLowerCase().includes(s) ||
        u.last_name.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s) ||
        u.degree.toLowerCase().includes(s);
      const mRole = !filters.role || u.role === filters.role;
      const mExp = !filters.experienceLevel || u.experience_level === filters.experienceLevel;
      const mGen = !filters.gender || u.gender === filters.gender;
      const mCiv = !filters.civilStatus || u.civil_status === filters.civilStatus;
      const mEdu = !filters.educationLevel || u.education_level === filters.educationLevel;
      const mCountry = !filters.countryCode || u.country_code === filters.countryCode;
      const mDespair = !filters.despairLevel || (u.despairLevel && u.despairLevel.level === filters.despairLevel);
      const age = parseInt(u.age) || 0;
      const mMinAge = !advancedFilters.minAge || age >= parseInt(advancedFilters.minAge);
      const mMaxAge = !advancedFilters.maxAge || age <= parseInt(advancedFilters.maxAge);
      const mDep = !advancedFilters.dependents || u.dependents === advancedFilters.dependents;
      const uDate = new Date(u.created_at);
      const mDateFrom = !advancedFilters.dateFrom || uDate >= new Date(advancedFilters.dateFrom);
      const mDateTo = !advancedFilters.dateTo || uDate <= new Date(advancedFilters.dateTo);
      const mScore = !advancedFilters.scoreCategory || (
        u.categoryScores?.[advancedFilters.scoreCategory] &&
        (!advancedFilters.minScore || u.categoryScores[advancedFilters.scoreCategory].percentage >= parseFloat(advancedFilters.minScore)) &&
        (!advancedFilters.maxScore || u.categoryScores[advancedFilters.scoreCategory].percentage <= parseFloat(advancedFilters.maxScore))
      );
      return mSearch && mRole && mExp && mGen && mCiv && mEdu && mCountry && mDespair &&
             mMinAge && mMaxAge && mDep && mDateFrom && mDateTo && mScore;
    });
    setFilteredUsers(filt);
  }, [filters, advancedFilters, users, setFilteredUsers]);

  const resetAllFilters = () => {
    setFilters({ search: '', role: '', experienceLevel: '', gender: '', civilStatus: '', educationLevel: '', countryCode: '', despairLevel: '' });
    setAdvancedFilters({ minAge: '', maxAge: '', minScore: '', maxScore: '', dependents: '', dateFrom: '', dateTo: '', scoreCategory: '' });
  };

  if (authChecking)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Verificando acceso...</div>
      </div>
    );
  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Cargando datos...</div>
      </div>
    );
  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-600">Error: {error}</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-neutral-50 pb-12">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-900">Panel de Administración</h1>
        </div>
        <div className="space-y-6">
          <CollapsibleSection title="Resumen del Panel">
            <DashboardSummary users={users} />
          </CollapsibleSection>
          <CollapsibleSection title="Configuración de Calificación" defaultOpen={false}>
            <AdminSettings />
          </CollapsibleSection>
          <CollapsibleSection title="Control de Calificación">
            <ScoringControls users={users} onScoreUpdate={updateUserScore} />
          </CollapsibleSection>
          <CollapsibleSection title="Filtros">
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
          </CollapsibleSection>
          {filteredUsers.length === 0 ? (
            <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
              <p className="text-neutral-600">No se encontraron usuarios con los filtros seleccionados.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredUsers.map(u => (
                <UserCard
                  key={u.id}
                  user={u}
                  responses={userResponses[u.id] || []}
                  isExpanded={expandedUser === u.id}
                  onToggle={() => toggleUserExpansion(u.id)}
                  loading={!userResponses[u.id]}
                  onScoreUpdate={updateUserScore}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
