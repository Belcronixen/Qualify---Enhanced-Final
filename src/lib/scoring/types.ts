export interface ScoringRequest {
  responseText: string;
  questionId: string;
  userId: string;
}

export interface ScoringResult {
  score: number;
}

export interface QuestionDetails {
  question_text: string;
  measurement: string;
}
