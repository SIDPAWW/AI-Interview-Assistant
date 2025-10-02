
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
// Set up PDF.js worker for Vite/React
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString();

export interface ParsedResumeData {
  name?: string;
  email?: string;
  phone?: string;
}

const extractEmail = (text: string): string | undefined => {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex);
  return matches ? matches[0] : undefined;
};

const extractPhone = (text: string): string | undefined => {
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const matches = text.match(phoneRegex);
  return matches ? matches[0] : undefined;
};

const extractName = (text: string): string | undefined => {
  // Try to extract name from first few lines
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    // Check if first line looks like a name (2-4 words, no special characters)
    if (/^[A-Za-z\s]{2,50}$/.test(firstLine) && firstLine.split(' ').length <= 4) {
      return firstLine;
    }
  }
  return undefined;
};

export const parsePDFResume = async (file: File): Promise<ParsedResumeData> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // Extract text from all pages
    for (let i = 1; i <= Math.min(pdf.numPages, 2); i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    return {
      name: extractName(fullText),
      email: extractEmail(fullText),
      phone: extractPhone(fullText),
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse resume PDF');
  }
};

export const validateFileType = (file: File): boolean => {
  const validTypes = ['application/pdf'];
  return validTypes.includes(file.type);
};
