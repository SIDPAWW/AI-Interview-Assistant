import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText } from 'lucide-react';
import { parsePDFResume, validateFileType } from '@/utils/resumeParser';
import { toast } from 'sonner';

interface ResumeUploadProps {
  onResumeData: (data: { name?: string; email?: string; phone?: string }) => void;
  onSkip: () => void;
}

const ResumeUpload = ({ onResumeData, onSkip }: ResumeUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFileType(file)) {
      toast.error('Please upload a PDF file');
      return;
    }

    setIsUploading(true);
    setFileName(file.name);

    try {
      const data = await parsePDFResume(file);
      toast.success('Resume parsed successfully');
      onResumeData(data);
    } catch (error: any) {
      toast.error(`Failed to parse resume: ${error?.message || error}`);
      setFileName('');
      console.error('Resume parsing error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-6 w-6 text-primary" />
            <CardTitle>Upload Your Resume</CardTitle>
          </div>
          <CardDescription>
            Upload your resume to auto-fill your information, or skip to enter manually.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full"
            size="lg"
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? 'Uploading...' : fileName || 'Upload Resume (PDF)'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button onClick={onSkip} variant="outline" className="w-full">
            Skip & Enter Manually
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumeUpload;
