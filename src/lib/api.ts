import { scoreResponse } from './scoring';
import type { ScoringRequest } from './scoring/types';

export async function scoreUserResponse(
  responseText: string,
  questionId: string,
  userId: string
) {
  try {
    console.log('🚀 Starting scoring request:', { 
      responseLength: responseText.length,
      questionId, 
      userId
    });

    const request: ScoringRequest = {
      responseText,
      questionId,
      userId
    };

    return await scoreResponse(request);
  } catch (error) {
    console.error('💥 Error scoring response:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}
