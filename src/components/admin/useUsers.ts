import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { QuestionnaireUser, UserResponse, Filters, AdvancedFilters, DespairLevel } from './types';

export function useUsers() {
  const [users, setUsers] = useState<QuestionnaireUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<QuestionnaireUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to calculate category scores
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
    async function fetchUsers() {
      try {
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
              .eq('user_id', user.id);
            const categoryScores = calcCategoryScores(responses || []);
            const despairLevel = calculateDespairLevel(responses || []);
            return { ...user, categoryScores, despairLevel, responses };
          })
        );
        setUsers(usersWithScores);
        setFilteredUsers(usersWithScores);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const updateUserScore = (userId: string, questionId: string, score: number | null) => {
    setUsers(prev =>
      prev.map(user => {
        if (user.id !== userId) return user;
        const updatedResponses = user.responses?.map(r =>
          r.question_id !== questionId ? r : { ...r, score }
        );
        const categoryScores = calcCategoryScores(updatedResponses || []);
        const despairLevel = calculateDespairLevel(updatedResponses || []);
        return { ...user, responses: updatedResponses, categoryScores, despairLevel };
      })
    );
    setFilteredUsers(prev =>
      prev.map(user => (user.id !== userId ? user : users.find(u => u.id === userId) || user))
    );
  };

  return { users, filteredUsers, setFilteredUsers, loading, error, updateUserScore };
}
