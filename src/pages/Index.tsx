
import { ApplicationForm } from "@/components/ApplicationForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-16 px-4">
      <div className="max-w-2xl mx-auto mb-16 text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Apply with confidence
        </h1>
        <p className="text-xl text-muted-foreground">
          Submit your application and let our AI-powered platform match you with the perfect opportunity.
        </p>
      </div>
      <ApplicationForm />
    </div>
  );
};

export default Index;
