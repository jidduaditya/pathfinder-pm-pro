import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Mock questions for frontend demo
const mockQuestions = [
  { id: "q1", type: "multiple_choice", text: "What is the primary goal of a product roadmap?", options: ["List all features to build", "Communicate strategic direction and priorities", "Track engineering velocity", "Assign tasks to team members"] },
  { id: "q2", type: "scenario", text: "Your CEO wants to launch a feature next week that you believe needs more user research. How would you handle this situation?" },
  { id: "q3", type: "multiple_choice", text: "Which metric best measures product-market fit for a B2B SaaS product?", options: ["Monthly Active Users", "Net Revenue Retention", "Page views", "Number of features shipped"] },
  { id: "q4", type: "open_text", text: "Describe how you would prioritise features when you have limited engineering resources and multiple stakeholder requests." },
  { id: "q5", type: "multiple_choice", text: "What is a common anti-pattern when writing user stories?", options: ["Including acceptance criteria", "Writing from the user's perspective", "Describing implementation details instead of outcomes", "Keeping stories small and testable"] },
  { id: "q6", type: "scenario", text: "You discover that a recently launched feature has a 2% adoption rate after one month. Walk me through how you'd diagnose and address this." },
  { id: "q7", type: "multiple_choice", text: "When conducting A/B tests, what determines the minimum sample size?", options: ["Number of engineers available", "Minimum detectable effect and statistical significance level", "How long the CEO is willing to wait", "The number of features being tested"] },
  { id: "q8", type: "open_text", text: "How would you define and measure success for a new onboarding flow?" },
  { id: "q9", type: "multiple_choice", text: "What is the main benefit of using a jobs-to-be-done framework?", options: ["It replaces the need for user interviews", "It focuses on the underlying need rather than the solution", "It simplifies engineering estimates", "It eliminates the need for competitive analysis"] },
  { id: "q10", type: "scenario", text: "Your data team tells you the key metric you've been optimising is actually a vanity metric. How do you respond and what steps do you take?" },
];

const STORAGE_KEY_PREFIX = "pmgps_quiz_answers_";

const QuizPage = () => {
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId: string }>();
  const storageKey = `${STORAGE_KEY_PREFIX}${quizId}`;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [submitting, setSubmitting] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  const questions = mockQuestions;
  const question = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const currentAnswer = answers[question.id] || "";

  const isTextType = question.type === "scenario" || question.type === "open_text";
  const canProceed = isTextType ? currentAnswer.length >= 50 : currentAnswer.length > 0;

  // Auto-save answers
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(answers));
  }, [answers, storageKey]);

  const setAnswer = useCallback(
    (value: string) => {
      setAnswers((prev) => ({ ...prev, [question.id]: value }));
    },
    [question.id]
  );

  const handleNext = async () => {
    if (!isLast) {
      setCurrentIndex((i) => i + 1);
      return;
    }

    // Submit
    setSubmitting(true);
    setProcessingStep(1);

    try {
      const timer = setTimeout(() => setProcessingStep(2), 3000);
      const res = await apiFetch(`/api/quiz/${quizId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      clearTimeout(timer);

      if (!res.ok) throw new Error("Submit failed");
      const data = await res.json();
      setProcessingStep(2);
      await new Promise((r) => setTimeout(r, 2000));
      localStorage.removeItem(storageKey);
      navigate(`/roadmap/diagnosis/${quizId}`, { state: { roadmapId: data.roadmap_id } });
    } catch {
      setSubmitting(false);
      setProcessingStep(0);
      toast({
        title: "Something went wrong submitting your answers. Your answers are saved — please try again.",
        variant: "destructive",
      });
    }
  };

  if (submitting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-8 animate-fade-in">
          <div className="mx-auto flex flex-col items-center gap-6">
            {["Reviewing your answers...", "Building your diagnosis..."].map((label, i) => {
              const stepNum = i + 1;
              const active = processingStep === stepNum;
              const done = processingStep > stepNum;
              return (
                <div key={label} className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all",
                      done
                        ? "border-success bg-success text-success-foreground"
                        : active
                        ? "border-primary bg-primary/10 text-primary animate-pulse-slow"
                        : "border-border text-muted-foreground"
                    )}
                  >
                    {done ? <Check className="h-4 w-4" /> : stepNum}
                  </div>
                  <span className={cn("text-sm", done ? "text-success" : active ? "text-foreground font-medium" : "text-muted-foreground")}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl py-10 animate-fade-in">
        {/* Progress */}
        <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{Math.round(((currentIndex + 1) / questions.length) * 100)}%</span>
        </div>
        <Progress value={((currentIndex + 1) / questions.length) * 100} className="h-2" />

        {/* Question */}
        <div className="mt-10">
          <p className="text-lg font-semibold text-foreground leading-relaxed">{question.text}</p>
        </div>

        {/* Answer area */}
        <div className="mt-8">
          {question.type === "multiple_choice" && question.options ? (
            <RadioGroup value={currentAnswer} onValueChange={setAnswer} className="space-y-3">
              {question.options.map((opt, i) => (
                <label
                  key={i}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all",
                    currentAnswer === opt
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  <RadioGroupItem value={opt} id={`opt-${i}`} />
                  <Label htmlFor={`opt-${i}`} className="cursor-pointer text-sm text-foreground">
                    {opt}
                  </Label>
                </label>
              ))}
            </RadioGroup>
          ) : (
            <div>
              <Textarea
                value={currentAnswer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Walk me through your thinking. No need for frameworks — just reason out loud."
                className="min-h-[160px]"
              />
              <p className={cn("mt-2 text-xs", currentAnswer.length < 50 ? "text-muted-foreground" : "text-success")}>
                {currentAnswer.length} / 50 minimum characters
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-end">
          <Button onClick={handleNext} disabled={!canProceed}>
            {isLast ? "Submit answers →" : "Next →"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
