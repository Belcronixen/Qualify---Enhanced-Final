import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  QuestionnaireUser,
  UserResponse,
  Filters,
  AdvancedFilters,
  DespairLevel,
} from './types';
import { deleteUserAndResponses, updateUserResponseScore } from '../../lib/api';

export function useUsers() {
  const [users, setUsers] = useState<QuestionnaireUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<QuestionnaireUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  async function fetchUsers() {
    try {
      setLoading(true);
      setError(null);
      const { data: usersData, error: usersError } = await supabase
        .from('questionnaire_users')
        .select('*')
        .order('created_at', { ascending: false });
      if (usersError) throw usersError;
      const usersWithScores = await Promise.all(
        (usersData || []).map(async user => {
          const { data: responses } = await supabase
            .from('user_responses')
            .select(`
              id,
              score,
              response_text,
              is_selection_response,
              selected_option,
              question_id,
              question:questions!inner (
                question_text,
                is_selection,
                is_despair,
                selection_1_score,
                selection_2_score,
                selection_3_score,
                selection_4_score,
                category:categories!inner ( name )
              )
            `)
            .eq('user_id', user.id)
            .not('question.is_hidden', 'eq', true);
          const categoryScores = calcCategoryScores(responses || []);
          const despairLevel = calculateDespairLevel(responses || []);
          return { ...user, categoryScores, despairLevel, responses };
        })
      );
      setUsers(usersWithScores);
      setFilteredUsers(usersWithScores);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }

  function calcCategoryScores(responses: UserResponse[]) {
    const scores: { [key: string]: { score: number; total: number; percentage: number } } = {};
    responses.forEach(r => {
      const cat = r.question?.category?.name;
      if (cat && r.score !== null) {
        if (!scores[cat]) scores[cat] = { score: 0, total: 0, percentage: 0 };
        scores[cat].score += r.score;
        scores[cat].total++;
      }
    });
    Object.values(scores).forEach(c => {
      if (c.total) c.percentage = (c.score / c.total) * 100;
    });
    return scores;
  }

  function calculateDespairLevel(responses: UserResponse[]): DespairLevel | undefined {
    const despairResponses = responses.filter(r => r.question?.is_despair && r.score !== null);
    if (!despairResponses.length) return undefined;
    const totalScore = despairResponses.reduce((sum, r) => sum + (r.score || 0), 0);
    const averageScore = totalScore / despairResponses.length;
    let level: 'none' | 'low' | 'medium' | 'high';
    if (averageScore <= 0.25) level = 'none';
    else if (averageScore <= 0.5) level = 'low';
    else if (averageScore <= 0.75) level = 'medium';
    else level = 'high';
    return { level, score: averageScore, percentage: averageScore * 100 };
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUserScore = async (userId: string, responseId: string, newScore: number) => {
    try {
      console.log('Updating score:', { userId, responseId, newScore });
      
      // Update the score in the database
      await updateUserResponseScore(responseId, newScore);
      
      // Create a function to update a single user's data
      const updateUserData = (user: QuestionnaireUser): QuestionnaireUser => {
        if (user.id !== userId) return user;
        
        // Update the responses array with the new score
        const updatedResponses = user.responses?.map(response => 
          response.id === responseId
            ? { ...response, score: newScore }
            : response
        ) || [];

        // Recalculate scores and levels
        const categoryScores = calcCategoryScores(updatedResponses);
        const despairLevel = calculateDespairLevel(updatedResponses);

        // Return the updated user object
        return {
          ...user,
          responses: updatedResponses,
          categoryScores,
          despairLevel,
        };
      };

      // Update both users and filteredUsers states
      setUsers(prevUsers => prevUsers.map(updateUserData));
      setFilteredUsers(prevFiltered => prevFiltered.map(updateUserData));

      console.log('Score updated successfully in UI');
    } catch (err) {
      console.error('Error updating score:', err);
      throw err;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await deleteUserAndResponses(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
      setFilteredUsers(prev => prev.filter(user => user.id !== userId));
    } catch (err) {
      console.error("Error deleting user:", err);
      throw err;
    }
  };

  return { 
    users, 
    filteredUsers, 
    setFilteredUsers, 
    loading, 
    error, 
    updateUserScore, 
    deleteUser,
    lastUpdate,
    refetch: fetchUsers 
  };
}