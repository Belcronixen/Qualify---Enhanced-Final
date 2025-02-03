import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { UserResponse } from './types';

interface UserResponsesProps {
  responses: UserResponse[];
  loading: boolean;
}

interface GroupedResponses {
  [category: string]: UserResponse[];
}

export function UserResponses({ responses, loading }: UserResponsesProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  
  if (loading)
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
  
  const grouped = responses.reduce((acc: GroupedResponses, r) => {
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
  
  return (
    <div className="p-6">
      <h3 className="mb-6 text-lg font-medium text-neutral-900">Respuestas por Categoría</h3>
      {responses.length === 0 ? (
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
                        {resps.map(r => (
                          <div key={r.id} className="p-4">
                            <h4 className="mb-2 font-medium text-neutral-900">
                              {r.question?.question_text}
                            </h4>
                            {r.is_selection_response ? (
                              <div className="space-y-2">
                                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                                  <p className="text-sm font-medium text-neutral-700">Opción seleccionada:</p>
                                  <p className="mt-1 text-sm text-neutral-900">{getOptionText(r)}</p>
                                </div>
                                {r.score !== null && (
                                  <div className="flex items-center justify-end">
                                    <div className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                      Puntuación: {r.score.toFixed(1)}/1
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <>
                                <p className="whitespace-pre-wrap text-sm text-neutral-700">
                                  {r.response_text}
                                </p>
                                {r.score !== null && (
                                  <div className="mt-4 flex items-center justify-end">
                                    <div className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                      Puntuación: {r.score.toFixed(1)}/1
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        ))}
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
