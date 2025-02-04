import { supabase } from './supabase';
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
      userId,
    });
    const request: ScoringRequest = {
      responseText,
      questionId,
      userId,
    };
    return await scoreResponse(request);
  } catch (error) {
    console.error('💥 Error scoring response:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

export async function deleteUserAndResponses(userId: string) {
  // Delete all responses associated with the user
  const { error: responsesError } = await supabase
    .from('user_responses')
    .delete()
    .eq('user_id', userId);
  if (responsesError) {
    throw responsesError;
  }
  // Delete the user record
  const { error: userError } = await supabase
    .from('questionnaire_users')
    .delete()
    .eq('id', userId);
  if (userError) {
    throw userError;
  }
  return { success: true };
}

export async function updateUserResponseScore(responseId: string, newScore: number) {
  console.log('Updating score:', { responseId, newScore });
  const { data, error } = await supabase
    .rpc('update_response_score', {
      response_id: responseId,
      new_score: newScore
    });

  if (error) {
    console.error('Error updating score:', error);
    throw error;
  }

  console.log('Score updated successfully:', data);
  return data;
}
