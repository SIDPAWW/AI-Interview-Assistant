import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Candidate } from '@/redux/slices/candidateSlice';
import { Mail, Phone, Calendar, Clock } from 'lucide-react';
import { formatTime } from '@/utils/timers';

interface CandidateDetailProps {
  candidate: Candidate | null;
  open: boolean;
  onClose: () => void;
}

const CandidateDetail = ({ candidate, open, onClose }: CandidateDetailProps) => {
  if (!candidate) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-accent text-accent-foreground';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      case 'hard':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-accent';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Interview Details</DialogTitle>
        </DialogHeader>

        {/* Candidate Info */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">{candidate.name}</h3>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {candidate.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {candidate.phone}
              </div>
            </div>
          </div>

          {/* Final Score */}
          {candidate.finalScore !== undefined && (
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Final Score</span>
                <span className={`text-3xl font-bold ${getScoreColor(candidate.finalScore)}`}>
                  {candidate.finalScore}/100
                </span>
              </div>
              {candidate.summary && (
                <p className="text-sm text-muted-foreground mt-2">{candidate.summary}</p>
              )}
            </div>
          )}

          {/* Interview Details */}
          <div className="flex gap-4 text-sm">
            {candidate.startTime && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(candidate.startTime).toLocaleDateString()}</span>
              </div>
            )}
            {candidate.endTime && candidate.startTime && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  Duration: {Math.round((new Date(candidate.endTime).getTime() - new Date(candidate.startTime).getTime()) / 1000 / 60)} mins
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* Questions & Answers */}
          <div className="space-y-6">
            <h4 className="font-semibold text-lg">Questions & Answers</h4>
            {candidate.questions.map((q, idx) => (
              <div key={q.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">Question {idx + 1}</span>
                      <Badge className={getDifficultyColor(q.difficulty)}>
                        {q.difficulty}
                      </Badge>
                      {q.score !== undefined && (
                        <Badge variant="outline" className={getScoreColor(q.score)}>
                          {q.score}/100
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm mb-3">{q.text}</p>
                  </div>
                </div>

                {q.answer && (
                  <div className="bg-muted p-3 rounded">
                    <p className="text-sm font-medium mb-1">Answer:</p>
                    <p className="text-sm whitespace-pre-wrap">{q.answer}</p>
                  </div>
                )}

                {q.timeSpent !== undefined && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Time spent: {formatTime(q.timeSpent)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CandidateDetail;
