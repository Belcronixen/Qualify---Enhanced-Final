import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { useQuestionnaireStore } from '../store/useQuestionnaireStore';
import { Timer } from './Timer';
import { supabase, type Question } from '../lib/supabase';
import { CheckCircle, AlertCircle } from 'lucide-react';

const shuffleArray = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

interface SelectionOption { number: number; text: string; }

export function QuestionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentQuestionIndex,
    answers,
    nextQuestion,
    userData,
    resetQuestionnaire,
    startTime,
    setStartTime,
    userId,
  } = useQuestionnaireStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  useEffect(() => {
    if (!userData?.email) {
      console.warn('No user data, redirecting to questionnaire');
      navigate('/questionnaire');
      return;
    }

    async function fetchQuestions() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('is_hidden', false)
          .order('order', { ascending: true });

        console.log('Fetched questions:', data);
        console.log('Fetch error:', error);

        if (error) throw error;

        // If all questions are hidden, show completion modal directly
        if (!data || data.length === 0) {
          if (userId) {
            // Update completion time to 0 since we're skipping questions
            const { error: updateError } = await supabase
              .from('questionnaire_users')
              .update({ completion_time: 0 })
              .eq('id', userId);
            if (updateError) throw updateError;
          }
          setShowCompletionModal(true);
          setLoading(false);
          return;
        }

        setQuestions(data);
        if (!startTime) setStartTime(Date.now());
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError(err instanceof Error ? err.message : 'Error inesperado al cargar preguntas');
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [userData, navigate, startTime, setStartTime, userId]);

  const shuffledOptions = useMemo(() => {
    const q = questions[currentQuestionIndex];
    if (!q?.is_selection) return [];
    const opts: SelectionOption[] = [];
    for (let i = 1; i <= 4; i++) {
      const txt = q[`selection_${i}` as keyof Question];
      if (txt) opts.push({ number: i, text: txt as string });
    }
    return shuffleArray(opts);
  }, [currentQuestionIndex, questions]);

  useEffect(() => {
    const q = questions[currentQuestionIndex];
    if (q) {
      const saved = answers[q.id];
      if (q.is_selection) {
        setSelectedOption(saved ? parseInt(saved) : null);
        setCurrentAnswer('');
      } else {
        setCurrentAnswer(saved || '');
        setSelectedOption(null);
      }
    }
  }, [currentQuestionIndex, questions, answers]);

  const handleNext = async () => {
    const q = questions[currentQuestionIndex];
    if (!q || !userId) return;
    if (q.is_selection && selectedOption === null) {
      alert('Por favor, selecciona una opción antes de continuar.');
      return;
    }
    if (!q.is_selection && !currentAnswer.trim()) {
      alert('Por favor, responde la pregunta antes de continuar.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const { error: respError } = await supabase.from('user_responses').insert({
        user_id: userId,
        question_id: q.id,
        response_text: q.is_selection ? '' : currentAnswer,
        is_selection_response: q.is_selection,
        selected_option: q.is_selection ? selectedOption : null,
      });
      if (respError) throw respError;
      if (currentQuestionIndex < questions.length - 1) {
        nextQuestion();
        setCurrentAnswer('');
        setSelectedOption(null);
      } else {
        const compTime = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
        const { error: updError } = await supabase
          .from('questionnaire_users')
          .update({ completion_time: compTime })
          .eq('id', userId);
        if (updError) throw updError;
        setShowCompletionModal(true);
      }
    } catch (err) {
      console.error('Error saving response:', err);
      setSubmitError(err instanceof Error ? err.message : 'Error al guardar la respuesta. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    resetQuestionnaire();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-lg text-neutral-500">Cargando preguntas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="w-full max-w-md rounded-lg border border-red-200 bg-red-50 p-4 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-600" />
          <h2 className="mt-2 text-lg font-semibold text-red-900">Error</h2>
          <p className="mt-1 text-red-600">{error}</p>
          <Button onClick={() => navigate('/questionnaire')} className="mt-4" variant="outline">
            Volver al Inicio
          </Button>
        </div>
      </div>
    );
  }

  // If all questions are hidden, only show the completion modal
  if (showCompletionModal) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl sm:p-8"
        >
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-green-100 p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-neutral-900 sm:text-2xl">
              ¡Felicitaciones!
            </h2>
            <p className="mb-6 text-neutral-600">
              Hemos recibido tus datos exitosamente. Nuestro equipo los revisará y nos pondremos en contacto contigo.
            </p>
            <p className="mb-8 text-sm text-neutral-500">
              Apreciamos tu tiempo y esfuerzo.
            </p>
            <Button onClick={handleFinish} size="lg" className="w-full sm:w-auto">
              Volver al Inicio
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main render method for questions
  return (
    <div className="min-h-[100dvh] bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[100dvh] flex-col items-center justify-center py-12">
          <div className="w-full max-w-2xl px-4 sm:px-0">
            <div className="mb-8">
              <Timer startTime={startTime || 0} />
              <div className="mt-4 text-sm text-neutral-500">
                Pregunta {currentQuestionIndex + 1} de {questions.length}
              </div>
            </div>
            <AnimatePresence mode="wait">
              {questions[currentQuestionIndex] && (
                <motion.div
                  key={questions[currentQuestionIndex].id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-semibold text-neutral-900 sm:text-2xl">
                    {questions[currentQuestionIndex].question_text}
                  </h2>
                  {questions[currentQuestionIndex].is_selection ? (
                    <div className="space-y-4">
                      {shuffledOptions.map(opt => (
                        <button
                          key={opt.number}
                          onClick={() => setSelectedOption(opt.number)}
                          className={`w-full rounded-lg border p-4 text-left transition-colors ${
                            selectedOption === opt.number
                              ? 'border-neutral-900 bg-neutral-900 text-white'
                              : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                          }`}
                        >
                          {opt.text}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      value={currentAnswer}
                      onChange={e => setCurrentAnswer(e.target.value)}
                      className="min-h-[200px] w-full rounded-md border border-neutral-200 p-4 text-neutral-900 shadow-sm focus:border-neutral-500 focus:ring-neutral-500"
                      placeholder="Escribe tu respuesta aquí..."
                    />
                  )}
                  {submitError && (
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{submitError}</div>
                  )}
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleNext} 
                      disabled={isSubmitting || (questions[currentQuestionIndex].is_selection ? selectedOption === null : !currentAnswer.trim())} 
                      className="w-full sm:w-auto"
                    >
                      {isSubmitting ? 'Guardando...' : currentQuestionIndex === questions.length - 1 ? 'Finalizar' : 'Siguiente'}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}