import { useState } from 'react';
import { useUsers } from '../useUsers';
import { ScoringControls } from '../ScoringControls';
import { CollapsibleSection } from '../CollapsibleSection';
import { AdminSettings } from '../AdminSettings';

export function ScoringPage() {
  const { users, updateUserScore } = useUsers();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Control de Calificación</h1>
        <p className="mt-2 text-neutral-400">
          Gestiona y automatiza la calificación de respuestas
        </p>
      </div>

      <CollapsibleSection title="Configuración de Calificación">
        <AdminSettings />
      </CollapsibleSection>

      <CollapsibleSection title="Control de Calificación Automática">
        <ScoringControls 
          users={users} 
          onScoreUpdate={updateUserScore} 
        />
      </CollapsibleSection>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-900/20 p-4 text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
