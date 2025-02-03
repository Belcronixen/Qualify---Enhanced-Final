import { useUsers } from '../useUsers';
import { ScoringControls } from '../ScoringControls';

export function ScoringPage() {
  const { users, updateUserScore } = useUsers();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Control de Calificación</h1>
      <ScoringControls users={users} onScoreUpdate={updateUserScore} />
    </div>
  );
}
