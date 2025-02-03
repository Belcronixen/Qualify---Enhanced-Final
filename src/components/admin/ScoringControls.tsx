import { useState, useCallback, useEffect, useRef } from 'react';
import { Play, Pause, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/button';
import { QuestionnaireUser } from './types';
import { scoreUserResponse } from '../../lib/api';
import { supabase } from '../../lib/supabase';

interface ScoringControlsProps {
  users: QuestionnaireUser[];
  onScoreUpdate: (userId: string, questionId: string, score: number) => void;
}

export function ScoringControls({ users, onScoreUpdate }: ScoringControlsProps) {
  const [isScoring, setIsScoring] = useState(false);
  const isScoringRef = useRef(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ total: 0, completed: 0, failed: 0 });
  const [logs, setLogs] = useState<string[]>([]);
  const [showConsole, setShowConsole] = useState(true);
  const [unscoredResponses, setUnscoredResponses] = useState<Array<{ userId: string; questionId: string; responseText: string; questionText?: string; retryCount?: number }>>([]);
  const [failedResponses, setFailedResponses] = useState<Array<{ userId: string; questionId: string; responseText: string; error: string }>>([]);

  const addLog = useCallback((msg: string, type: 'info' | 'error' | 'success' = 'info') => {
    const ts = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '❌ ' : type === 'success' ? '✅ ' : '📝 ';
    setLogs(prev => [`[${ts}] ${prefix}${msg}`, ...prev]);
  }, []);

  useEffect(() => {
    addLog('Finding unscored responses...');
    const unscored = users.flatMap(user =>
      (user.responses || [])
        .filter(r => !r.is_selection_response && r.score === null)
        .map(r => ({
          userId: user.id,
          questionId: r.question_id,
          responseText: r.response_text,
          questionText: r.question?.question_text,
          retryCount: 0
        }))
    );
    addLog(`Found ${unscored.length} unscored responses`, 'info');
    setUnscoredResponses(unscored);
    setFailedResponses([]);
  }, [users, addLog]);

  const processResponse = async (r: typeof unscoredResponses[0]) => {
    if (!r) return false;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const metadata = session?.user?.user_metadata;
      const provider = metadata?.scoring_provider;
      const model = metadata?.scoring_model;
      const apiKey = metadata?.[`${provider}_api_key`];
      if (!provider || !model || !apiKey)
        throw new Error('Por favor configura el proveedor de IA y la clave API en la sección de configuración');
      const truncated = r.responseText.length > 100 ? r.responseText.substring(0, 100) + '...' : r.responseText;
      addLog(`Processing response for question: ${r.questionText || 'Unknown'}`);
      addLog(`Response (${r.responseText.length} chars): "${truncated}"`);
      const { score } = await scoreUserResponse(r.responseText, r.questionId, r.userId);
      addLog(`Score received: ${score}`, 'success');
      onScoreUpdate(r.userId, r.questionId, score);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      addLog(`Error scoring response: ${msg}`, 'error');
      if ((r.retryCount || 0) >= 2) {
        setFailedResponses(prev => [...prev, { userId: r.userId, questionId: r.questionId, responseText: r.responseText, error: msg }]);
        return true;
      }
      r.retryCount = (r.retryCount || 0) + 1;
      return false;
    }
  };

  const startScoring = useCallback(async () => {
    if (!unscoredResponses.length) {
      addLog('No responses to score', 'error');
      setError('No hay respuestas pendientes por calificar');
      return;
    }
    addLog('Starting scoring process');
    setIsScoring(true);
    isScoringRef.current = true;
    setError(null);
    setProgress({ total: unscoredResponses.length, completed: 0, failed: 0 });
    setFailedResponses([]);
    const responses = [...unscoredResponses];
    while (responses.length && isScoringRef.current) {
      const r = responses[0];
      setCurrentUser(r.userId);
      setCurrentQuestion(r.questionId);
      const processed = await processResponse(r);
      if (processed) {
        responses.shift();
        setProgress(prev => ({ ...prev, completed: prev.completed + 1, failed: failedResponses.length }));
      } else {
        responses.push(responses.shift()!);
      }
      if (isScoringRef.current && responses.length) {
        addLog('Waiting before next request...');
        await new Promise(res => setTimeout(res, 2000));
      }
    }
    addLog('Scoring process completed');
    if (failedResponses.length)
      addLog(`${failedResponses.length} responses failed after max retries`, 'error');
    setIsScoring(false);
    isScoringRef.current = false;
    setCurrentUser(null);
    setCurrentQuestion(null);
  }, [unscoredResponses, onScoreUpdate, addLog, failedResponses.length]);

  const stopScoring = useCallback(() => {
    addLog('Stopping scoring process');
    setIsScoring(false);
    isScoringRef.current = false;
  }, [addLog]);

  const getCurrentUserName = useCallback(() => {
    const user = users.find(u => u.id === currentUser);
    return user ? `${user.first_name} ${user.last_name}` : '';
  }, [currentUser, users]);

  const getQuestionText = useCallback(() => {
    const user = users.find(u => u.id === currentUser);
    const resp = user?.responses?.find(r => r.question_id === currentQuestion);
    return resp?.question?.question_text || '';
  }, [currentUser, currentQuestion, users]);

  return (
    <div className="mb-6 rounded-lg border border-neutral-200 bg-white p-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Calificación Automática</h3>
          <Button onClick={isScoring ? stopScoring : startScoring} disabled={!unscoredResponses.length} className="flex items-center gap-2">
            {isScoring ? (
              <>
                <Pause className="h-4 w-4" /> Detener Calificación
              </>
            ) : (
              <>
                <Play className="h-4 w-4" /> Iniciar Calificación
              </>
            )}
          </Button>
        </div>
        {isScoring && currentUser && (
          <div className="space-y-2">
            <div className="text-sm text-neutral-600">
              Calificando respuestas de: <span className="font-medium">{getCurrentUserName()}</span>
            </div>
            <div className="text-sm text-neutral-600">
              Pregunta actual: <span className="font-medium">{getQuestionText()}</span>
            </div>
            <div className="text-sm text-neutral-600">
              Progreso: {progress.completed} de {progress.total} respuestas
              {progress.failed > 0 && <span className="ml-2 text-red-600">({progress.failed} fallidas)</span>}
            </div>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}
        <div className="text-sm text-neutral-600">
          {unscoredResponses.length === 0 ? (
            <span className="text-green-600">Todas las respuestas han sido calificadas</span>
          ) : (
            `${unscoredResponses.length} respuestas pendientes por calificar`
          )}
        </div>
        {failedResponses.length > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <h4 className="mb-2 font-medium text-red-700">Respuestas Fallidas ({failedResponses.length})</h4>
            <div className="max-h-[200px] overflow-auto">
              {failedResponses.map((f, i) => (
                <div key={i} className="mb-2 text-sm text-red-600">
                  <div>Usuario: {users.find(u => u.id === f.userId)?.email}</div>
                  <div>Error: {f.error}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mt-4">
          <Button variant="outline" onClick={() => setShowConsole(!showConsole)} className="flex w-full items-center justify-between">
            <span>Console Log</span>
            {showConsole ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          {showConsole && (
            <div className="mt-2 max-h-[400px] overflow-auto rounded-lg border border-neutral-200 bg-neutral-50 p-4 font-mono text-xs">
              {logs.map((l, i) => (
                <div key={i} className={`whitespace-pre-wrap py-1 ${l.includes('❌') ? 'text-red-600' : l.includes('✅') ? 'text-green-600' : 'text-neutral-600'}`}>
                  {l}
                </div>
              ))}
              {!logs.length && <div className="text-neutral-500">No hay registros disponibles</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
