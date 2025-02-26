
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { matchJobDescription } from "@/utils/ai";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface JobMatchingSectionProps {
  resumeText: string;
}

export const JobMatchingSection = ({ resumeText }: JobMatchingSectionProps) => {
  const [jobDescription, setJobDescription] = useState("");
  const [matching, setMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<{
    matchScore: number;
    feedback: string;
    missingSkills: string[];
  } | null>(null);

  const handleMatch = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please enter a job description");
      return;
    }

    setMatching(true);
    try {
      const result = await matchJobDescription(resumeText, jobDescription);
      setMatchResult(result);
    } catch (error) {
      console.error("Failed to match job description:", error);
      toast.error("Failed to analyze job match. Please try again.");
    } finally {
      setMatching(false);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Job Matching</h2>
        <p className="text-sm text-muted-foreground">
          Enter a job description to see how well this candidate matches.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="jobDescription">Job Description</Label>
          <Textarea
            id="jobDescription"
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="min-h-[200px]"
          />
        </div>

        <Button onClick={handleMatch} disabled={matching}>
          {matching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing match...
            </>
          ) : (
            "Analyze Match"
          )}
        </Button>

        {matchResult && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <h3 className="font-semibold">Match Analysis</h3>
              <div className="flex items-center space-x-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${matchResult.matchScore}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {matchResult.matchScore}% Match
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Feedback</h4>
              <p className="text-sm text-muted-foreground">{matchResult.feedback}</p>
            </div>

            {matchResult.missingSkills.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Missing Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {matchResult.missingSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
