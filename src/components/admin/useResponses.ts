import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { UserResponse } from './types';

export function useResponses() {
  const [userResponses, setUserResponses] = useState<{ [key: string]: UserResponse[] }>({});
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUserResponses = async (userId: string) => {
    try {
      setLoading(true);
      const { data: responses, error: responsesError } = await supabase
        .from('user_responses')
        .select(`
          id,
          response_text,
          score,
          created_at,
          is_selection_response,
          selected_option,
          question_id,
          question:questions!inner (
            question_text,
            is_despair,
            selection_1,
            selection_2,
            selection_3,
            selection_4,
            category:categories!inner (
              name
            )
          )
        `)
        .eq('user_id', userId)
        .not('question.is_hidden', 'eq', true)
        .order('created_at', { ascending: true });

      if (responsesError) throw responsesError;
      setUserResponses(prev => ({ ...prev, [userId]: responses || [] }));
    } catch (err) {
      console.error('Error fetching responses:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserExpansion = (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
      if (!userResponses[userId]) {
        fetchUserResponses(userId);
      }
    }
  };

  return {
    userResponses,
    expandedUser,
    toggleUserExpansion,
    loading
  };
}
