import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface WelcomeBackModalProps {
  open: boolean;
  candidateName: string;
  questionsAnswered: number;
  totalQuestions: number;
  onContinue: () => void;
  onStartNew: () => void;
}

const WelcomeBackModal = ({ 
  open, 
  candidateName, 
  questionsAnswered, 
  totalQuestions,
  onContinue, 
  onStartNew 
}: WelcomeBackModalProps) => {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-6 w-6 text-primary" />
            <DialogTitle>Welcome Back, {candidateName}!</DialogTitle>
          </div>
          <DialogDescription>
            You have an interview in progress. You've answered {questionsAnswered} out of {totalQuestions} questions.
            Would you like to continue where you left off or start a new interview?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button onClick={onStartNew} variant="outline">
            Start New Interview
          </Button>
          <Button onClick={onContinue}>
            Continue Interview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeBackModal;
