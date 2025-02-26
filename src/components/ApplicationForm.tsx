
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ResumeUpload } from "./ResumeUpload";
import { SkillsInput } from "./SkillsInput";
import { JobMatchingSection } from "./JobMatchingSection";
import { toast } from "sonner";
import { analyzeResume, CandidateProfile } from "@/utils/ai";
import { Loader2 } from "lucide-react";

export const ApplicationForm = () => {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CandidateProfile | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    linkedin: "",
    skills: [] as string[],
    resumeText: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Form submitted:", formData);
      toast.success("Application submitted successfully!");

      setFormData({
        name: "",
        email: "",
        linkedin: "",
        skills: [],
        resumeText: "",
      });
      setAnalysis(null);
    } catch (error) {
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResumeProcessed = async (text: string) => {
    setFormData({ ...formData, resumeText: text });
    setAnalyzing(true);

    try {
      if (!localStorage.getItem('gemini_api_key')) {
        localStorage.setItem('gemini_api_key', 'AIzaSyBAaQtGg36VqGPB5B2LLCtdEu0ml8IwrJg');
      }

      const profile = await analyzeResume(text);
      setAnalysis(profile);
      
      setFormData(prev => ({
        ...prev,
        skills: [...new Set([...prev.skills, ...profile.skills])]
      }));

      toast.success("Resume analyzed successfully!");
    } catch (error) {
      console.error("Failed to analyze resume:", error);
      toast.error("Failed to analyze resume. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Personal Information</h2>
          <p className="text-sm text-muted-foreground">
            Please provide your basic information to get started.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input
              id="linkedin"
              type="url"
              placeholder="https://linkedin.com/in/yourprofile"
              value={formData.linkedin}
              onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
              required
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Resume & Skills</h2>
          <p className="text-sm text-muted-foreground">
            Upload your resume and tell us about your skills.
          </p>
        </div>

        <ResumeUpload onResumeProcessed={handleResumeProcessed} />

        {analyzing && (
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Analyzing resume...</span>
          </div>
        )}

        {analysis && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <h3 className="font-semibold">AI Analysis</h3>
              <p className="text-sm text-muted-foreground">{analysis.summary}</p>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium mb-2">Experience</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {analysis.experience.map((exp, i) => (
                    <li key={i}>{exp}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Education</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {analysis.education.map((edu, i) => (
                    <li key={i}>{edu}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Profile Strength</h4>
              <div className="flex items-center space-x-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500" 
                    style={{ width: `${analysis.score}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{analysis.score}%</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{analysis.feedback}</p>
            </div>
          </div>
        )}

        <SkillsInput
          value={formData.skills}
          onChange={(skills) => setFormData({ ...formData, skills })}
        />
      </Card>

      {formData.resumeText && <JobMatchingSection resumeText={formData.resumeText} />}

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? "Submitting..." : "Submit Application"}
        </Button>
      </div>
    </form>
  );
};
