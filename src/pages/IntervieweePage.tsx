import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { createCandidate, startInterview, resumeInterview, resetActiveCandidate } from '@/redux/slices/candidateSlice';
import { generateInterviewQuestions } from '@/utils/aiService';
import ResumeUpload from '@/components/ResumeUpload';
import InfoCollectionChat from '@/components/InfoCollectionChat';
import InterviewChat from '@/components/InterviewChat';
import WelcomeBackModal from '@/components/WelcomeBackModal';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

type Stage = 'resume-upload' | 'info-collection' | 'interview' | 'loading';


const IntervieweePage = () => {
  const dispatch = useDispatch();
  const activeCandidate = useSelector((state: RootState) => state.candidate.activeCandidate);
  const [stage, setStage] = useState<Stage>('resume-upload');
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [welcomeBackDismissed, setWelcomeBackDismissed] = useState(false);

  useEffect(() => {
    // Check for existing session
    if (activeCandidate && activeCandidate.status !== 'completed') {
      if (activeCandidate.status === 'in-progress') {
        // Only show modal if not already dismissed
        if (!welcomeBackDismissed) {
          setShowWelcomeBack(true);
        } else {
          setShowWelcomeBack(false);
        }
      } else if (activeCandidate.status === 'info-collection') {
        setStage('info-collection');
      }
    } else {
      setStage('resume-upload');
    }
  }, [activeCandidate, welcomeBackDismissed]);




  const handleResumeData = (data: { name?: string; email?: string; phone?: string }) => {
    dispatch(createCandidate(data));
    setStage('info-collection');
  };

  const handleSkipResume = () => {
    dispatch(createCandidate({}));
    setStage('info-collection');
  };

  const handleInfoComplete = async () => {
    setStage('loading');
    try {
      const questions = await generateInterviewQuestions();
      dispatch(startInterview(questions));
      setStage('interview');
    } catch (error) {
      toast.error('Failed to generate interview questions');
      setStage('info-collection');
    }
  };


  const handleContinueInterview = () => {
    dispatch(resumeInterview());
    setShowWelcomeBack(false);
    setWelcomeBackDismissed(true);
    setStage('interview');
  };

  const handleStartNewInterview = () => {
    dispatch(resetActiveCandidate());
    setShowWelcomeBack(false);
    setWelcomeBackDismissed(true);
    setStage('resume-upload');
  };



  return (
    <>
  {showWelcomeBack && activeCandidate && !welcomeBackDismissed && (
        <WelcomeBackModal
          open={showWelcomeBack}
          candidateName={activeCandidate.name || 'Candidate'}
          questionsAnswered={activeCandidate.currentQuestionIndex}
          totalQuestions={activeCandidate.questions.length}
          onContinue={handleContinueInterview}
          onStartNew={handleStartNewInterview}
        />
      )}
      {stage === 'loading' ? (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Generating interview questions...</p>
          </div>
        </div>
      ) : (
        <>
          {/* ApiKeySetup removed, API key now loaded from .env */}
          {stage === 'resume-upload' && (
            <ResumeUpload onResumeData={handleResumeData} onSkip={handleSkipResume} />
          )}
          {stage === 'info-collection' && <InfoCollectionChat onComplete={handleInfoComplete} />}
          {stage === 'interview' && <InterviewChat />}
        </>
      )}
    </>
  );
};

export default IntervieweePage;
