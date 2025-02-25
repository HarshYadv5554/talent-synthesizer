
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ResumeUpload } from "./ResumeUpload";
import { SkillsInput } from "./SkillsInput";
import { toast } from "sonner";

export const ApplicationForm = () => {
  const [loading, setLoading] = useState(false);
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
      // In a real app, we'd send this to an API
      console.log("Form submitted:", formData);
      toast.success("Application submitted successfully!");
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        linkedin: "",
        skills: [],
        resumeText: "",
      });
    } catch (error) {
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
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

        <ResumeUpload
          onResumeProcessed={(text) => setFormData({ ...formData, resumeText: text })}
        />

        <SkillsInput
          value={formData.skills}
          onChange={(skills) => setFormData({ ...formData, skills })}
        />
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? "Submitting..." : "Submit Application"}
        </Button>
      </div>
    </form>
  );
};
