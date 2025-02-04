import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { UserResponse } from './types';
import { Button } from '../ui/button';

interface UserResponsesProps {
  responses: UserResponse[];
  loading: boolean;
  englishLevelFilter?: string;
  englishProficiencyFilter?: string;
  onUpdateScore: (userId: string, responseId: string, newScore: number) => void;
  userId: string;
}

interface GroupedResponses {
  [category: string]: UserResponse[];
}

export function UserResponses({
  responses: initialResponses,
  loading,
  englishLevelFilter,
  englishProficiencyFilter,
  onUpdateScore,
  userId,
}: UserResponsesProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [editingResponseId, setEditingResponseId] = useState<string | null>(null);
  const [tempScore, setTempScore] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [localScores, setLocalScores] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex animate-pulse space-y-4">
          <div className="space-y-3">
            <div className="h-4 w-1/4 rounded bg-neutral-200" />
            <div className="h-4 w-1/2 rounded bg-neutral-200" />
            <div className="h-4 w-3/4 rounded bg-neutral-200" />
          </div>
        </div>
      </div>
    );
  }

  // Use either the local score or the original score
  const getResponseScore = (response: UserResponse) => {
    return localScores[response.id] !== undefined 
      ? localScores[response.id] 
      : response.score;
  };

  const filteredResponses = initialResponses.filter(r => {
    if (englishLevelFilter && r.english_level !== englishLevelFilter) return false;
    if (englishProficiencyFilter && r.english_proficiency !== englishProficiencyFilter) return false;
    return true;
  });

  const grouped = filteredResponses.reduce((acc: GroupedResponses, r) => {
    const cat = r.question?.category?.name || 'Sin Categoría';
    (acc[cat] = acc[cat] || []).push(r);
    return acc;
  }, {} as GroupedResponses);

  const toggle = (cat: string) =>
    setExpandedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );

  const getOptionText = (r: UserResponse) =>
    r.is_selection_response && r.selected_option
      ? r.question?.[`selection_${r.selected_option}`] || ''
      : '';

  const handleEditClick = (response: UserResponse) => {
    const currentScore = getResponseScore(response);
    setEditingResponseId(response.id);
    setTempScore(currentScore !== null ? currentScore.toString() : '');
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingResponseId(null);
    setTempScore('');
    setError(null);
  };

  const handleSaveScore = async (response: UserResponse) => {
    try {
      setIsSubmitting(true);
      const newScore = parseFloat(tempScore);
      if (isNaN(newScore) || newScore < 0 || newScore > 1) {
        setError("La puntuación debe estar entre 0 y 1");
        return;
      }

      setLocalScores(prev => ({
        ...prev,
        [response.id]: newScore 
      }));
      
      await onUpdateScore(userId, response.id, newScore).catch(err => {
        console.error('Error updating score in database:', err);
        setLocalScores(prev => ({
          ...prev,
          [response.id]: response.score
        }));
        throw err;
      });

      setEditingResponseId(null);
      setTempScore('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar la puntuación");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h3 className="mb-6 text-lg font-medium text-neutral-900">Respuestas por Categoría</h3>
      {filteredResponses.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-neutral-200 p-6 text-center">
          <p className="text-neutral-600">No hay respuestas registradas.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([cat, resps]) => {
            const expanded = expandedCategories.includes(cat);
            return (
              <div key={cat} className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
                <button
                  onClick={() => toggle(cat)}
                  className="flex w-full items-center justify-between bg-neutral-50 px-4 py-3 text-left transition-colors hover:bg-neutral-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-neutral-900">{cat}</span>
                    <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs text-neutral-700">
                      {resps.length}
                    </span>
                  </div>
                  {expanded ? (
                    <ChevronUp className="h-5 w-5 text-neutral-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-neutral-500" />
                  )}
                </button>
                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="divide-y divide-neutral-100">
                        {resps.map(r => {
                          const currentScore = getResponseScore(r);
                          return (
                            <div key={r.id} className="p-4">
                              <h4 className="mb-2 font-medium text-neutral-900">
                                {r.question?.question_text}
                              </h4>
                              {r.is_selection_response ? (
                                <div className="space-y-2">
                                  <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                                    <p className="text-sm font-medium text-neutral-700">
                                      Opción seleccionada:
                                    </p>
                                    <p className="mt-1 text-sm text-neutral-900">{getOptionText(r)}</p>
                                  </div>
                                  {currentScore !== null && (
                                    <div className="mt-2 flex items-center justify-end space-x-2">
                                      {editingResponseId === r.id ? (
                                        <>
                                          <input
                                            type="number"
                                            value={tempScore}
                                            onChange={(e) => setTempScore(e.target.value)}
                                            step="0.1"
                                            min="0"
                                            max="1"
                                            className="w-20 rounded-md border border-neutral-300 px-2 py-1 text-sm"
                                          />
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleSaveScore(r)}
                                            className="text-green-600 hover:bg-green-50"
                                            disabled={isSubmitting}
                                          >
                                            {isSubmitting ? 'Guardando...' : 'Guardar'}
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={handleCancelEdit}
                                            className="text-neutral-600"
                                            disabled={isSubmitting}
                                          >
                                            Cancelar
                                          </Button>
                                        </>
                                      ) : (
                                        <>
                                          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                            Puntuación: {currentScore.toFixed(2)}/1
                                          </span>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleEditClick(r)}
                                            className="text-blue-600 hover:bg-blue-50"
                                          >
                                            Editar
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <>
                                  <p className="whitespace-pre-wrap text-sm text-neutral-700">
                                    {r.response_text}
                                  </p>
                                  {currentScore !== null && (
                                    <div className="mt-4 flex items-center justify-end space-x-2">
                                      {editingResponseId === r.id ? (
                                        <>
                                          <input
                                            type="number"
                                            value={tempScore}
                                            onChange={(e) => setTempScore(e.target.value)}
                                            step="0.1"
                                            min="0"
                                            max="1"
                                            className="w-20 rounded-md border border-neutral-300 px-2 py-1 text-sm"
                                          />
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleSaveScore(r)}
                                            className="text-green-600 hover:bg-green-50"
                                            disabled={isSubmitting}
                                          >
                                            {isSubmitting ? 'Guardando...' : 'Guardar'}
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={handleCancelEdit}
                                            className="text-neutral-600"
                                            disabled={isSubmitting}
                                          >
                                            Cancelar
                                          </Button>
                                        </>
                                      ) : (
                                        <>
                                          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                            Puntuación: {currentScore.toFixed(2)}/1
                                          </span>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleEditClick(r)}
                                            className="text-blue-600 hover:bg-blue-50"
                                          >
                                            Editar
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </>
                              )}
                              {error && editingResponseId === r.id && (
                                <div className="mt-2 text-sm text-red-600">{error}</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}