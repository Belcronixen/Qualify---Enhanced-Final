export interface Filters {
  search: string;
  role: string;
  experienceLevel: string;
  gender: string;
  civilStatus: string;
  educationLevel: string;
  countryCode: string;
  despairLevel: string;
  english_level: string;
  english_proficiency: string;
}

export interface AdvancedFilters {
  minAge: string;
  maxAge: string;
  minScore: string;
  maxScore: string;
  dependents: string;
  dateFrom: string;
  dateTo: string;
  scoreCategory: string;
}

export interface DespairLevel {
  level: 'none' | 'low' | 'medium' | 'high';
  score: number;
  percentage: number;
}

export interface QuestionnaireUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  experience_level: string;
  age: string;
  gender: string;
  civil_status: string;
  dependents: string;
  education_level: string;
  degree: string;
  created_at: string;
  completion_time: number | null;
  country_code: string;
  phone_number: string;
  responses?: UserResponse[];
  categoryScores?: {
    [key: string]: {
      score: number;
      total: number;
      percentage: number;
    };
  };
  despairLevel?: DespairLevel;
  english_level?: string;
  english_proficiency?: string;
}

export interface UserResponse {
  id: string;
  response_text: string;
  score: number | null;
  created_at: string;
  question_id: string;
  is_selection_response: boolean;
  selected_option: number | null;
  question: {
    question_text: string;
    is_despair?: boolean;
    selection_1?: string;
    selection_2?: string;
    selection_3?: string;
    selection_4?: string;
    category: {
      name: string;
    };
  };
}

export interface DeleteUserResponse {
  success: boolean;
}
