import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  text: string;
  difficulty: QuestionDifficulty;
  answer?: string;
  score?: number;
  timeSpent?: number;
  timestamp?: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  resumeUploaded: boolean;
  currentQuestionIndex: number;
  questions: Question[];
  finalScore?: number;
  summary?: string;
  status: 'info-collection' | 'in-progress' | 'completed';
  startTime?: string;
  endTime?: string;
  lastActiveTime?: string;
}

interface CandidateState {
  candidates: Candidate[];
  activeCandidate: Candidate | null;
}

const initialState: CandidateState = {
  candidates: [],
  activeCandidate: null,
};

const candidateSlice = createSlice({
  name: 'candidate',
  initialState,
  reducers: {
    createCandidate: (state, action: PayloadAction<{ name?: string; email?: string; phone?: string }>) => {
      const newCandidate: Candidate = {
        id: Date.now().toString(),
        name: action.payload.name || '',
        email: action.payload.email || '',
        phone: action.payload.phone || '',
        resumeUploaded: false,
        currentQuestionIndex: 0,
        questions: [],
        status: 'info-collection',
        lastActiveTime: new Date().toISOString(),
      };
      state.activeCandidate = newCandidate;
    },
    
    updateCandidateInfo: (state, action: PayloadAction<Partial<Pick<Candidate, 'name' | 'email' | 'phone'>>>) => {
      if (state.activeCandidate) {
        state.activeCandidate = {
          ...state.activeCandidate,
          ...action.payload,
          lastActiveTime: new Date().toISOString(),
        };
      }
    },

    setResumeUploaded: (state) => {
      if (state.activeCandidate) {
        state.activeCandidate.resumeUploaded = true;
        state.activeCandidate.lastActiveTime = new Date().toISOString();
      }
    },

    startInterview: (state, action: PayloadAction<Question[]>) => {
      if (state.activeCandidate) {
        state.activeCandidate.questions = action.payload;
        state.activeCandidate.status = 'in-progress';
        state.activeCandidate.startTime = new Date().toISOString();
        state.activeCandidate.currentQuestionIndex = 0;
        state.activeCandidate.lastActiveTime = new Date().toISOString();
      }
    },

    submitAnswer: (state, action: PayloadAction<{ answer: string; timeSpent: number }>) => {
      if (state.activeCandidate && state.activeCandidate.questions[state.activeCandidate.currentQuestionIndex]) {
        state.activeCandidate.questions[state.activeCandidate.currentQuestionIndex].answer = action.payload.answer;
        state.activeCandidate.questions[state.activeCandidate.currentQuestionIndex].timeSpent = action.payload.timeSpent;
        state.activeCandidate.questions[state.activeCandidate.currentQuestionIndex].timestamp = new Date().toISOString();
        state.activeCandidate.lastActiveTime = new Date().toISOString();
      }
    },

    nextQuestion: (state) => {
      if (state.activeCandidate) {
        state.activeCandidate.currentQuestionIndex += 1;
        state.activeCandidate.lastActiveTime = new Date().toISOString();
      }
    },

    completeInterview: (state, action: PayloadAction<{ score: number; summary: string }>) => {
      if (state.activeCandidate) {
        state.activeCandidate.finalScore = action.payload.score;
        state.activeCandidate.summary = action.payload.summary;
        state.activeCandidate.status = 'completed';
        state.activeCandidate.endTime = new Date().toISOString();
        state.activeCandidate.lastActiveTime = new Date().toISOString();
        
        // Save to candidates list
        state.candidates.push({ ...state.activeCandidate });
        state.activeCandidate = null;
      }
    },

    updateQuestionScore: (state, action: PayloadAction<{ questionId: string; score: number }>) => {
      if (state.activeCandidate) {
        const question = state.activeCandidate.questions.find(q => q.id === action.payload.questionId);
        if (question) {
          question.score = action.payload.score;
        }
      }
    },

    resumeInterview: (state) => {
      if (state.activeCandidate) {
        state.activeCandidate.lastActiveTime = new Date().toISOString();
      }
    },

    resetActiveCandidate: (state) => {
      state.activeCandidate = null;
    },
  },
});

export const {
  createCandidate,
  updateCandidateInfo,
  setResumeUploaded,
  startInterview,
  submitAnswer,
  nextQuestion,
  completeInterview,
  updateQuestionScore,
  resumeInterview,
  resetActiveCandidate,
} = candidateSlice.actions;

export default candidateSlice.reducer;
