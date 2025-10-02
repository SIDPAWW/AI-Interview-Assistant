
import axios from 'axios';
import { Question, QuestionDifficulty } from '@/redux/slices/candidateSlice';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const openaiClient = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
  },
});


export const generateInterviewQuestions = async (): Promise<Question[]> => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not set in environment');
  }

  const difficulties: QuestionDifficulty[] = ['easy', 'easy', 'medium', 'medium', 'hard', 'hard'];
  
  const prompt = `Generate 6 full-stack developer interview questions (React/Node.js focus):
- 2 Easy questions (basic concepts, syntax)
- 2 Medium questions (problem-solving, design patterns)
- 2 Hard questions (system design, complex algorithms)

Return ONLY a JSON array with this exact structure:
[
  {"difficulty": "easy", "text": "question text here"},
  {"difficulty": "easy", "text": "question text here"},
  {"difficulty": "medium", "text": "question text here"},
  {"difficulty": "medium", "text": "question text here"},
  {"difficulty": "hard", "text": "question text here"},
  {"difficulty": "hard", "text": "question text here"}
]`;

  try {
    const response = await openaiClient.post('/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a technical interviewer. Return only valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    });

    const content = response.data.choices[0].message.content;
    const questions = JSON.parse(content);
    
    return questions.map((q: any, index: number) => ({
      id: `q-${Date.now()}-${index}`,
      text: q.text,
      difficulty: q.difficulty as QuestionDifficulty,
    }));
  } catch (error) {
    console.error('Error generating questions:', error);
    throw new Error('Failed to generate interview questions');
  }
};

export const evaluateAnswer = async (question: string, answer: string, difficulty: QuestionDifficulty): Promise<number> => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not set in environment');
  }

  const prompt = `Evaluate this interview answer on a scale of 0-100:

Question (${difficulty}): ${question}
Answer: ${answer}

Scoring criteria:
- Technical accuracy (40%)
- Completeness (30%)
- Clarity (20%)
- Bonus points (10%)

Return ONLY a number between 0 and 100.`;

  try {
    const response = await openaiClient.post('/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a technical interviewer. Return only a number.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
    });

    const scoreText = response.data.choices[0].message.content.trim();
    const score = parseInt(scoreText, 10);
    
    return Math.min(100, Math.max(0, score));
  } catch (error) {
    console.error('Error evaluating answer:', error);
    return 0;
  }
};

export const generateFinalSummary = async (questions: Question[]): Promise<{ score: number; summary: string }> => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not set in environment');
  }

  const answeredQuestions = questions.filter(q => q.answer && q.score !== undefined);
  const totalScore = answeredQuestions.reduce((sum, q) => sum + (q.score || 0), 0);
  const averageScore = answeredQuestions.length > 0 ? Math.round(totalScore / answeredQuestions.length) : 0;

  const prompt = `Create a brief interview summary (2-3 sentences):

Questions answered: ${answeredQuestions.length}/6
Average score: ${averageScore}/100

Question details:
${questions.map((q, i) => `Q${i + 1} (${q.difficulty}): Score ${q.score || 'N/A'}/100`).join('\n')}

Focus on: overall performance, strengths, areas for improvement.`;

  try {
    const response = await openaiClient.post('/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a technical interviewer. Be concise and constructive.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    });

    const summary = response.data.choices[0].message.content.trim();
    
    return { score: averageScore, summary };
  } catch (error) {
    console.error('Error generating summary:', error);
    return { score: averageScore, summary: 'Summary generation failed.' };
  }
};
