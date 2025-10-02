import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Bot, User } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { updateCandidateInfo, setResumeUploaded } from '@/redux/slices/candidateSlice';

interface Message {
  role: 'bot' | 'user';
  content: string;
}

interface InfoCollectionChatProps {
  onComplete: () => void;
}

const InfoCollectionChat = ({ onComplete }: InfoCollectionChatProps) => {
  const dispatch = useDispatch();
  const activeCandidate = useSelector((state: RootState) => state.candidate.activeCandidate);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [currentField, setCurrentField] = useState<'name' | 'email' | 'phone' | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If all details are present, show summary and skip questions
    const isNameMissing = !activeCandidate?.name || activeCandidate.name.trim() === '';
    const isEmailMissing = !activeCandidate?.email || activeCandidate.email.trim() === '';
    const isPhoneMissing = !activeCandidate?.phone || activeCandidate.phone.trim() === '';

    // If any field is missing, ask only for the missing ones in order
    if (isNameMissing) {
      setCurrentField('name');
      setMessages([{ role: 'bot', content: "Hi! I'm your AI interview assistant. Let's start by getting to know you. What's your full name?" }]);
    } else if (isEmailMissing) {
      setCurrentField('email');
      setMessages([{ role: 'bot', content: `Nice to meet you, ${activeCandidate.name}! What's your email address?` }]);
    } else if (isPhoneMissing) {
      setCurrentField('phone');
      setMessages([{ role: 'bot', content: "Great! And what's your phone number?" }]);
    } else {
      setCurrentField(null);
      setMessages([
        { role: 'bot', content: `Here are your details from the resume:` },
        { role: 'bot', content: `Name: ${activeCandidate.name}` },
        { role: 'bot', content: `Email: ${activeCandidate.email}` },
        { role: 'bot', content: `Phone: ${activeCandidate.phone}` },
        { role: 'bot', content: "Perfect! We have all your information. Ready to start the interview?" }
      ]);
      dispatch(setResumeUploaded());
    }
  }, [activeCandidate, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentField) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);

    // Update Redux state
    dispatch(updateCandidateInfo({ [currentField]: input.trim() }));

    setTimeout(() => {
      // Re-check which field is missing after update
      const updatedCandidate = {
        ...activeCandidate,
        [currentField]: input.trim(),
      };
      const isNameMissing = !updatedCandidate?.name || updatedCandidate.name.trim() === '';
      const isEmailMissing = !updatedCandidate?.email || updatedCandidate.email.trim() === '';
      const isPhoneMissing = !updatedCandidate?.phone || updatedCandidate.phone.trim() === '';

      if (isNameMissing) {
        setCurrentField('name');
        setMessages(prev => [...prev, { role: 'bot', content: "Hi! I'm your AI interview assistant. Let's start by getting to know you. What's your full name?" }]);
      } else if (isEmailMissing) {
        setCurrentField('email');
        setMessages(prev => [...prev, { role: 'bot', content: `Nice to meet you, ${updatedCandidate.name}! What's your email address?` }]);
      } else if (isPhoneMissing) {
        setCurrentField('phone');
        setMessages(prev => [...prev, { role: 'bot', content: "Great! And what's your phone number?" }]);
      } else {
        setCurrentField(null);
        setMessages(prev => [
          ...prev,
          { role: 'bot', content: `Here are your details from the resume:` },
          { role: 'bot', content: `Name: ${updatedCandidate.name}` },
          { role: 'bot', content: `Email: ${updatedCandidate.email}` },
          { role: 'bot', content: `Phone: ${updatedCandidate.phone}` },
          { role: 'bot', content: "Perfect! We have all your information. Ready to start the interview?" }
        ]);
        dispatch(setResumeUploaded());
      }
      setInput('');
    }, 500);
  };

  const handleStartInterview = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
              )}
              <div className={`max-w-[70%] rounded-lg p-3 ${
                msg.role === 'bot' ? 'bg-muted' : 'bg-primary text-primary-foreground'
              }`}>
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-accent-foreground" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t p-4">
          {currentField ? (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Enter your ${currentField}...`}
                className="flex-1"
                autoFocus
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <Button onClick={handleStartInterview} className="w-full" size="lg">
              Start Interview
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default InfoCollectionChat;
