import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Play,
  RotateCcw,
  Eraser,
  AlertTriangle,
  Trash2,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { QuestionnaireUser, UserResponse } from './types';
import { UserResponses } from './UserResponses';
import { CategoryScores } from './CategoryScores';
import { UserInfo } from './UserInfo';
import { scoreUserResponse, deleteUserAndResponses } from '../../lib/api';
import { supabase } from '../../lib/supabase';

interface UserCardProps {
  user: QuestionnaireUser;
  responses: UserResponse[];
  isExpanded: boolean;
  onToggle: () => void;
  loading: boolean;
  onScoreUpdate: (userId: string, responseId: string, score: number | null) => void;
  onDelete: (userId: string) => void;
}

export function UserCard({
  user,
  responses,
  isExpanded,
  onToggle,
  loading,
  onScoreUpdate,
  onDelete,
}: UserCardProps) {
  const [isScoring, setIsScoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scoringProgress, setScoringProgress] = useState(0);
  const [showActions, setShowActions] = useState(false);

  const totalResponses = user.responses?.length || 0;
  const scoredResponses = user.responses?.filter((r) => r.score !== null).length || 0;
  const unscoredCount = totalResponses - scoredResponses;

  const handleViewCV = async () => {
    if (!user.cv_file_path) {
      alert('No hay CV disponible para este usuario');
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from('private')
        .createSignedUrl(user.cv_file_path, 300); // URL valid for 5 minutes

      if (error) throw error;
      
      if (data.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (err) {
      console.error('Error accessing CV:', err);
      setError('Error al acceder al CV. Por favor intenta de nuevo.');
    }
  };

  const handleScoreResponses = async () => {
    if (!user.responses) return;
    setIsScoring(true);
    setError(null);
    setScoringProgress(0);
    const toScore = user.responses.filter(
      (r) => !r.is_selection_response && r.score === null
    );
    let completed = 0;
    for (const r of toScore) {
      try {
        await getProviderConfig();
        const truncated =
          r.response_text.length > 100
            ? r.response_text.substring(0, 100) + '...'
            : r.response_text;
        const { score } = await scoreUserResponse(
          r.response_text,
          r.question_id,
          user.id
        );
        onScoreUpdate(user.id, r.id, score);
        completed++;
        setScoringProgress(Math.round((completed / toScore.length) * 100));
        await new Promise((res) => setTimeout(res, 2000));
      } catch (err) {
        console.error('Error scoring response:', err);
        setError(err instanceof Error ? err.message : 'Error al calificar las respuestas');
        break;
      }
    }
    setIsScoring(false);
    setScoringProgress(0);
  };

  const handleResetScores = async () => {
    if (!user.responses) return;
    setIsScoring(true);
    setError(null);
    try {
      await getProviderConfig();
      await resetNonSelectionScores(user.id);
      user.responses
        .filter((r) => !r.is_selection_response)
        .forEach((r) => onScoreUpdate(user.id, r.id, null));
      await handleScoreResponses();
    } catch (err) {
      console.error('Error resetting scores:', err);
      setError(err instanceof Error ? err.message : 'Error al reiniciar las calificaciones');
    }
    setIsScoring(false);
  };

  const handleClearNonSelectionScores = async () => {
    if (!user.responses) return;
    setIsScoring(true);
    setError(null);
    try {
      await resetNonSelectionScores(user.id);
      user.responses
        .filter((r) => !r.is_selection_response)
        .forEach((r) => onScoreUpdate(user.id, r.id, null));
    } catch (err) {
      console.error('Error clearing scores:', err);
      setError(err instanceof Error ? err.message : 'Error al borrar las calificaciones');
    }
    setIsScoring(false);
  };

  const handleDeleteUser = async () => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este usuario y todas sus respuestas?")) {
      return;
    }
    try {
      await deleteUserAndResponses(user.id);
      onDelete(user.id);
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(err instanceof Error ? err.message : "Error al eliminar el usuario");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group overflow-hidden rounded-xl border border-gray-300 bg-white shadow-lg transition-all duration-200"
    >
      <div className="p-4 md:p-6">
        <UserInfo user={user} />
        <div className="mt-4 md:hidden">
          <Button
            onClick={() => setShowActions(!showActions)}
            className="w-full justify-between"
            variant="outline"
          >
            <span>Acciones</span>
            {showActions ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        <AnimatePresence>
          {(showActions || window.matchMedia('(min-width: 769px)').matches) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 flex flex-col gap-2 md:mt-6 md:flex-row md:items-center"
            >
              <div className="flex flex-1 flex-col gap-2 md:flex-row">
                <Button
                  variant="outline"
                  onClick={handleScoreResponses}
                  disabled={isScoring || unscoredCount === 0}
                  className="flex items-center justify-center gap-2 md:justify-start"
                >
                  <Play className="h-4 w-4" />
                  {isScoring ? <span>{scoringProgress}%</span> : <span>Calificar</span>}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleResetScores}
                  disabled={isScoring || totalResponses === 0}
                  className="flex items-center justify-center gap-2 md:justify-start"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Recalificar</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClearNonSelectionScores}
                  disabled={isScoring || totalResponses === 0}
                  className="flex items-center justify-center gap-2 md:justify-start"
                >
                  <Eraser className="h-4 w-4" />
                  <span>Borrar</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleViewCV}
                  disabled={!user.cv_file_path}
                  className="flex items-center justify-center gap-2 md:justify-start"
                >
                  <FileText className="h-4 w-4" />
                  {user.cv_file_path ? 'Ver CV' : 'Sin CV'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDeleteUser}
                  className="flex items-center justify-center gap-2 md:justify-start text-red-600 border-red-300 hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Eliminar</span>
                </Button>
              </div>
              <Button
                variant="ghost"
                onClick={onToggle}
                className="flex items-center justify-center gap-2"
              >
                {isExpanded ? (
                  <>
                    <span>Ocultar</span>
                    <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <span>Ver Respuestas</span>
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-300 bg-red-100 p-4 text-sm text-red-700">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-gray-600">Progreso de Calificación</span>
            <span className="font-medium text-gray-900">
              {scoredResponses} de {totalResponses}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500"
              initial={{ width: 0 }}
              animate={{ width: `${(scoredResponses / totalResponses) * 100}%` }}
            />
          </div>
        </div>
        <div className="mt-6">
          <CategoryScores scores={user.categoryScores} />
        </div>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-300"
          >
            <UserResponses 
              responses={responses} 
              loading={loading}
              onUpdateScore={onScoreUpdate}
              userId={user.id}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}