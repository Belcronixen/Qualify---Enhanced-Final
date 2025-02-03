import { create } from 'zustand';

interface UserData {
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
  role: string;
  experienceLevel: string;
  email: string;
  civilStatus: string;
  dependents: string;
  educationLevel: string;
  degree: string;
  countryCode: string;
  phoneNumber: string;
}

interface QuestionnaireState {
  userData: UserData | null;
  userId: string | null;
  currentQuestionIndex: number;
  answers: Record<string, string>;
  startTime: number | null;
  setUser: (data: UserData) => void;
  setUserId: (id: string) => void;
  setAnswer: (questionId: string, answer: string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  resetQuestionnaire: () => void;
  setStartTime: (time: number) => void;
}

export const useQuestionnaireStore = create<QuestionnaireState>((set) => ({
  userData: null,
  userId: null,
  currentQuestionIndex: 0,
  answers: {},
  startTime: null,
  setUser: (data) => set({ userData: data }),
  setUserId: (id) => set({ userId: id }),
  setAnswer: (questionId, answer) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: answer },
    })),
  nextQuestion: () =>
    set((state) => ({ currentQuestionIndex: state.currentQuestionIndex + 1 })),
  previousQuestion: () =>
    set((state) => ({ currentQuestionIndex: state.currentQuestionIndex - 1 })),
  resetQuestionnaire: () =>
    set({
      currentQuestionIndex: 0,
      answers: {},
      startTime: null,
      userId: null,
    }),
  setStartTime: (time) => set({ startTime: time }),
}));
