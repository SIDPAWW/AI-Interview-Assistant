import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { submitAnswer, nextQuestion, completeInterview, updateQuestionScore } from '@/redux/slices/candidateSlice';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Bot, User, Clock, Send, Loader2 } from 'lucide-react';
import { getTimeForDifficulty, formatTime } from '@/utils/timers';
import { evaluateAnswer, generateFinalSummary } from '@/utils/aiService';
import { toast } from 'sonner';
import CandidateDetail from '@/components/CandidateDetail';

interface Message {
  role: 'bot' | 'user';
  content: string;
}

const InterviewChat = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const activeCandidate = useSelector((state: RootState) => state.candidate.activeCandidate);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: "Welcome to your technical interview! I'll ask you 6 questions covering various difficulty levels. Each question has a time limit. Let's begin!" }
  ]);
  const [input, setInput] = useState('');
  const inputRef = useRef('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [showScoreCard, setShowScoreCard] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = activeCandidate?.questions[activeCandidate.currentQuestionIndex];
  const totalQuestions = activeCandidate?.questions.length || 6;
  const currentIndex = activeCandidate?.currentQuestionIndex || 0;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  useEffect(() => {
    // Clear any existing timer before starting a new one
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (currentQuestion && !currentQuestion.answer) {
      const questionTime = getTimeForDifficulty(currentQuestion.difficulty);
      setTimeLeft(questionTime);
      setStartTime(Date.now());
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: `**Question ${currentIndex + 1} of ${totalQuestions}** (${currentQuestion.difficulty})\n\n${currentQuestion.text}\n\n*Time limit: ${formatTime(questionTime)}*`
      }]);

      // Start timer
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentQuestion]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  const handleAutoSubmit = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    // Use the latest value from the ref
    const answer = inputRef.current.trim() || 'No answer provided';
    handleAnswerSubmit(answer, true);
  };

  const handleAnswerSubmit = async (answer: string, isAutoSubmit: boolean = false) => {
    if (!currentQuestion) return;

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: answer 
    }]);
    
    dispatch(submitAnswer({ answer, timeSpent }));
    setInput('');
    setIsEvaluating(true);

    if (isAutoSubmit) {
      toast.error('Time\'s up! Answer auto-submitted.');
    }

    try {
      // Evaluate the answer
      const score = await evaluateAnswer(currentQuestion.text, answer, currentQuestion.difficulty);
      dispatch(updateQuestionScore({ questionId: currentQuestion.id, score }));

      // Check if this was the last question
      if (currentIndex + 1 >= totalQuestions) {
        setMessages(prev => [...prev, { 
          role: 'bot', 
          content: `Great job! You've completed all questions. Let me calculate your final score...`
        }]);

        // Generate final summary
        const allQuestions = [...activeCandidate!.questions];
        allQuestions[currentIndex] = { ...currentQuestion, answer, score };
        
        const { score: finalScore, summary } = await generateFinalSummary(allQuestions);
        
        dispatch(completeInterview({ score: finalScore, summary }));
        
        setMessages(prev => [...prev, { 
          role: 'bot', 
          content: `**Interview Complete!**\n\nYour final score: **${finalScore}/100**\n\n${summary}\n\nThank you for your time!`
        }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'bot', 
          content: `Answer recorded (Score: ${score}/100). Moving to next question...`
        }]);
        
        setTimeout(() => {
          dispatch(nextQuestion());
        }, 2000);
      }
    } catch (error) {
      toast.error('Failed to evaluate answer');
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: 'Sorry, there was an error evaluating your answer. Moving to next question...'
      }]);
      
      setTimeout(() => {
        dispatch(nextQuestion());
      }, 2000);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isEvaluating) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    handleAnswerSubmit(input.trim());
  };

  const isCompleted = activeCandidate?.status === 'completed';
  const canAnswer = !isEvaluating && !isCompleted && currentQuestion && !currentQuestion.answer;

  useEffect(() => {
    if (isCompleted && !showScoreCard) {
      navigate('/interviewer');
    }
  }, [isCompleted, showScoreCard, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl h-[700px] flex flex-col">
        {/* Header with progress */}
        <div className="border-b p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            {canAnswer && (
              <div className={`flex items-center gap-2 ${timeLeft <= 10 ? 'text-destructive' : timeLeft <= 30 ? 'text-warning' : 'text-muted-foreground'}`}>
                <Clock className="h-4 w-4" />
                <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-lg p-4 ${
                msg.role === 'bot' ? 'bg-muted' : 'bg-primary text-primary-foreground'
              }`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-accent-foreground" />
                </div>
              )}
            </div>
          ))}
          {isEvaluating && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Loader2 className="h-5 w-5 text-primary-foreground animate-spin" />
              </div>
              <div className="max-w-[80%] rounded-lg p-4 bg-muted">
                Evaluating your answer...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          {canAnswer ? (
            <form onSubmit={handleSubmit} className="space-y-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your answer here..."
                className="min-h-[100px] resize-none"
                autoFocus
              />
              <Button type="submit" className="w-full" disabled={!input.trim()}>
                <Send className="mr-2 h-4 w-4" />
                Submit Answer
              </Button>
            </form>
          ) : isCompleted ? (
            <div className="text-center text-muted-foreground">
              Interview completed. Thank you!
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              Please wait...
            </div>
          )}
        </div>
      </Card>
      <CandidateDetail
        candidate={activeCandidate}
        open={showScoreCard}
        onClose={() => setShowScoreCard(false)}
      />
    </div>
  );
};

export default InterviewChat;
