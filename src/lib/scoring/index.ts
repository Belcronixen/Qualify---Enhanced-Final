import { supabase } from '../supabase';
import { scoreWithOpenAI } from './openai';
import { scoreWithDeepseek } from './deepseek';
import type { ScoringRequest, ScoringResult } from './types';

const MAX_RETRIES = 5,
  BASE_DELAY = 5000,
  MAX_DELAY = 30000;
const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function scoreResponse(request: ScoringRequest): Promise<ScoringResult> {
  let lastError: any = null;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[Attempt ${attempt}/${MAX_RETRIES}] Scoring response:`, {
        responseLength: request.responseText.length,
        questionId: request.questionId,
        userId: request.userId,
        timestamp: new Date().toISOString()
      });
      const { data: question, error: questionError } = await supabase
        .from('questions')
        .select('question_text, measurement, prompt')
        .eq('id', request.questionId)
        .single();
      if (questionError) throw questionError;

      const { data: { session } } = await supabase.auth.getSession();
      const metadata = session?.user?.user_metadata;
      const provider = metadata?.scoring_provider || 'openai';
      const model = metadata?.scoring_model;
      const apiKey = metadata?.[`${provider}_api_key`];
      if (!apiKey || !model) {
        throw new Error(!apiKey ? `No API key configured for ${provider}` : `No model selected for ${provider}`);
      }

      const scoringPrompt = `Evalúa la siguiente respuesta y asigna un puntaje entre 0.0 y 1.0:

Pregunta: "${question.question_text}"

Respuesta del usuario: "${request.responseText}"

Criterios de evaluación: "${question.measurement}"

Instrucciones adicionales: "${question.prompt || ''}"

IMPORTANTE: 
- 0.0 representa la peor respuesta posible
- 1.0 representa una respuesta perfecta
- Usa decimales entre 0.0 y 1.0 para reflejar la calidad de la respuesta
- Responde ÚNICAMENTE con el número decimal, sin texto adicional`;

      const score =
        provider === 'openai'
          ? await scoreWithOpenAI(scoringPrompt, apiKey, model)
          : await scoreWithDeepseek(scoringPrompt, apiKey, model);

      const { error: updateError } = await supabase
        .from('user_responses')
        .update({ score })
        .eq('user_id', request.userId)
        .eq('question_id', request.questionId);
      if (updateError) throw updateError;

      return { score };
    } catch (error: any) {
      lastError = error;
      console.error(`[Attempt ${attempt}] Error:`, {
        message: error?.message,
        code: error?.code,
        response: error?.response?.data,
        stack: error?.stack
      });
      if (attempt < MAX_RETRIES) {
        const delay = Math.min(BASE_DELAY * 2 ** (attempt - 1), MAX_DELAY);
        console.log(`Retrying in ${delay}ms...`);
        await wait(delay);
      }
    }
  }
  throw lastError || new Error('Failed to score response after all retries');
}
