import { QuestionDifficulty } from '@/redux/slices/candidateSlice';

export const getTimeForDifficulty = (difficulty: QuestionDifficulty): number => {
  switch (difficulty) {
    case 'easy':
      return 20; // 20 seconds
    case 'medium':
      return 60; // 60 seconds
    case 'hard':
      return 120; // 120 seconds
    default:
      return 60;
  }
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
