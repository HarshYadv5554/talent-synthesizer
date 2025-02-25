
import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import * as pdfjsLib from "pdfjs-dist";
import { Upload, FileText, Check } from "lucide-react";
import { storeResumeVector } from "@/utils/vectorDb";
import { toast } from "sonner";

// Initialize PDF.js worker
const initializePdfLib = async () => {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = await import('pdfjs-dist/build/pdf.worker.mjs');
  } catch (error) {
    console.error('Error initializing PDF.js worker:', error);
  }
};

interface ResumeUploadProps {
  onResumeProcessed: (text: string) => void;
  metadata?: {
    name: string;
    email: string;
    skills: string[];
  };
}

export const ResumeUpload = ({ onResumeProcessed, metadata }: ResumeUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  useEffect(() => {
    initializePdfLib();
  }, []);

  const processFile = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument(arrayBuffer);
      const pdf = await loadingTask.promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = content.items
          .filter((item: any) => typeof item.str === 'string')
          .map((item: any) => item.str)
          .join(" ");
        fullText += text + " ";
      }

      const processedText = fullText.trim();
      
      if (metadata) {
        await storeResumeVector(processedText, metadata);
      }

      onResumeProcessed(processedText);
      setUploaded(true);
      toast.success("Resume processed successfully!");
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast.error("Failed to process resume. Please try again.");
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    try {
      await processFile(file);
    } catch (error) {
      console.error("Failed to process file:", error);
    } finally {
      setUploading(false);
    }
  }, [onResumeProcessed, metadata]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        transition-all duration-200 space-y-4
        ${isDragActive ? "border-primary bg-primary/5" : "border-gray-200"}
        ${uploading ? "opacity-50 pointer-events-none" : ""}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center space-y-4">
        {uploaded ? (
          <div className="text-success-foreground bg-success/20 p-4 rounded-full">
            <Check className="w-8 h-8" />
          </div>
        ) : (
          <div className="text-primary bg-primary/10 p-4 rounded-full">
            {uploading ? (
              <FileText className="w-8 h-8 animate-pulse" />
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </div>
        )}
        
        <div>
          <p className="text-lg font-medium">
            {uploaded
              ? "Resume uploaded successfully!"
              : uploading
              ? "Processing resume..."
              : "Drop your resume here"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {uploaded
              ? "Click or drag to replace"
              : "PDF files only, up to 10MB"}
          </p>
        </div>
      </div>
    </div>
  );
};
