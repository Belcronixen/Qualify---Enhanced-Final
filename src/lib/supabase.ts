import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'X-Client-Info': 'questionnaire-app'
    }
  },
  db: {
    schema: 'public'
  }
});

export type Question = {
  id: string;
  category_id: string;
  question_text: string;
  measurement: string;
  is_hidden: boolean;
  is_selection: boolean;
  order: number;
  created_at: string;
  selection_1?: string;
  selection_1_score?: number;
  selection_2?: string;
  selection_2_score?: number;
  selection_3?: string;
  selection_3_score?: number;
  selection_4?: string;
  selection_4_score?: number;
};

export type UserResponse = {
  id: string;
  user_id: string;
  question_id: string;
  response_text: string;
  is_selection_response: boolean;
  selected_option?: number;
  score: number | null;
  created_at: string;
  question?: {
    question_text: string;
    category?: {
      name: string;
    };
  };
};

export type Category = {
  id: string;
  name: string;
  description: string;
  created_at: string;
};
