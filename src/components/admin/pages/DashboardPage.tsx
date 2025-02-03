import { useState } from 'react';
import { useUsers } from '../useUsers';
import { DashboardSummary } from '../DashboardSummary';
import { CollapsibleSection } from '../CollapsibleSection';
import { UserCard } from '../UserCard';
import { useResponses } from '../useResponses';
import { motion } from 'framer-motion';
import { Users, AlertTriangle } from 'lucide-react';

export function DashboardPage() {
  const { users, loading, error, updateUserScore } = useUsers();
  const { userResponses, expandedUser, toggleUserExpansion } = useResponses();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="text-lg text-neutral-400">Cargando datos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-800 bg-red-900/50 p-6 text-center text-red-400">
        Error: {error}
      </div>
    );
  }

  // Get recent applicants (last 24 hours)
  const recentApplicants = users.filter(user => {
    const userDate = new Date(user.created_at);
    const now = new Date();
    const diff = now.getTime() - userDate.getTime();
    return diff <= 24 * 60 * 60 * 1000;
  });

  // Get high despair users
  const highDespairUsers = users.filter(user => 
    user.despairLevel?.level === 'high'
  );

  // Get incomplete evaluations
  const incompleteEvaluations = users.filter(user => {
    const responses = user.responses || [];
    return responses.some(r => r.score === null);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      </div>

      <CollapsibleSection title="Resumen General">
        <DashboardSummary users={users} />
      </CollapsibleSection>

      {recentApplicants.length > 0 && (
        <CollapsibleSection title={`Aplicantes Recientes (${recentApplicants.length})`}>
          <div className="space-y-4">
            {recentApplicants.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                responses={userResponses[user.id] || []}
                isExpanded={expandedUser === user.id}
                onToggle={() => toggleUserExpansion(user.id)}
                loading={!userResponses[user.id]}
                onScoreUpdate={updateUserScore}
              />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {highDespairUsers.length > 0 && (
        <CollapsibleSection 
          title={`Niveles Altos de Desesperación (${highDespairUsers.length})`}
          defaultOpen={false}
        >
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-800 bg-red-900/20 p-4 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm">
              Los siguientes aplicantes muestran niveles altos de desesperación y podrían necesitar atención especial.
            </p>
          </div>
          <div className="space-y-4">
            {highDespairUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                responses={userResponses[user.id] || []}
                isExpanded={expandedUser === user.id}
                onToggle={() => toggleUserExpansion(user.id)}
                loading={!userResponses[user.id]}
                onScoreUpdate={updateUserScore}
              />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {incompleteEvaluations.length > 0 && (
        <CollapsibleSection 
          title={`Evaluaciones Pendientes (${incompleteEvaluations.length})`}
          defaultOpen={false}
        >
          <div className="space-y-4">
            {incompleteEvaluations.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                responses={userResponses[user.id] || []}
                isExpanded={expandedUser === user.id}
                onToggle={() => toggleUserExpansion(user.id)}
                loading={!userResponses[user.id]}
                onScoreUpdate={updateUserScore}
              />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {users.length === 0 && (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/50 p-8 text-center shadow-lg backdrop-blur">
          <Users className="mb-4 h-12 w-12 text-neutral-700" />
          <p className="text-lg font-medium text-neutral-200">
            No hay aplicantes registrados
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Los aplicantes aparecerán aquí cuando completen el cuestionario
          </p>
        </div>
      )}
    </div>
  );
}
