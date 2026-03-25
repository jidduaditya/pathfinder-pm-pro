import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const mockQuestions = [
  { id: "q1", text: "What is the primary goal of a product roadmap?", options: ["List all features to build", "Communicate strategic direction and priorities", "Track engineering velocity", "Assign tasks to team members"] },
  { id: "q2", text: "Your CEO wants to launch a feature next week that you believe needs more user research. What is your best first step?", options: ["Agree and start building immediately", "Refuse and escalate to the board", "Present data on user research gaps and propose a compromise timeline", "Delegate the decision to your engineering lead"] },
  { id: "q3", text: "Which metric best measures product-market fit for a B2B SaaS product?", options: ["Monthly Active Users", "Net Revenue Retention", "Page views", "Number of features shipped"] },
  { id: "q4", text: "When prioritising features with limited engineering resources, which approach is most effective?", options: ["Build whatever the loudest stakeholder requests", "Use an impact vs effort framework to rank opportunities", "Ship the easiest features first to show progress", "Wait until more resources are available"] },
  { id: "q5", text: "What is a common anti-pattern when writing user stories?", options: ["Including acceptance criteria", "Writing from the user's perspective", "Describing implementation details instead of outcomes", "Keeping stories small and testable"] },
  { id: "q6", text: "A recently launched feature has a 2% adoption rate after one month. What should you do first?", options: ["Remove the feature immediately", "Analyse user behaviour data to understand why adoption is low", "Double the marketing budget for the feature", "Rebuild the feature from scratch with new technology"] },
  { id: "q7", text: "When conducting A/B tests, what determines the minimum sample size?", options: ["Number of engineers available", "Minimum detectable effect and statistical significance level", "How long the CEO is willing to wait", "The number of features being tested"] },
  { id: "q8", text: "How should you define success for a new onboarding flow?", options: ["By counting total signups", "By measuring activation rate and time-to-value", "By the number of onboarding screens", "By surveying the design team"] },
  { id: "q9", text: "What is the main benefit of using a jobs-to-be-done framework?", options: ["It replaces the need for user interviews", "It focuses on the underlying need rather than the solution", "It simplifies engineering estimates", "It eliminates the need for competitive analysis"] },
  { id: "q10", text: "Your data team tells you the key metric you've been optimising is a vanity metric. What do you do?", options: ["Ignore them and continue optimising", "Work with the data team to identify a metric tied to real business outcomes", "Switch to tracking revenue only", "Stop measuring metrics altogether"] },
];

const LETTERS = ["A", "B", "C", "D"] as const;
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
  const canProceed = currentAnswer.length > 0;

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(answers));
  }, [answers, storageKey]);

  const setAnswer = useCallback(
    (letter: string) => {
      setAnswers((prev) => {
        if (prev[question.id] === letter) {
          const next = { ...prev };
          delete next[question.id];
          return next;
        }
        return { ...prev, [question.id]: letter };
      });
    },
    [question.id]
  );

  const handleNext = async () => {
    if (!isLast) {
      setCurrentIndex((i) => i + 1);
      return;
    }

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

        {/* Dot indicators */}
        <div className="mt-3 flex items-center justify-center gap-2">
          {questions.map((q, i) => {
            const isAnswered = !!answers[q.id];
            const isCurrent = i === currentIndex;
            return (
              <div
                key={q.id}
                className={cn(
                  "h-2.5 w-2.5 rounded-full transition-all",
                  isCurrent
                    ? "border-2 border-primary bg-background"
                    : isAnswered
                    ? "bg-primary"
                    : "bg-muted-foreground/30"
                )}
              />
            );
          })}
        </div>

        {/* Question */}
        <div className="mt-10">
          <p className="text-lg font-semibold text-foreground leading-relaxed">{question.text}</p>
        </div>

        {/* MCQ Options */}
        <div className="mt-8 space-y-3">
          {question.options.map((opt, i) => {
            const letter = LETTERS[i];
            const isSelected = currentAnswer === letter;
            return (
              <button
                key={letter}
                type="button"
                onClick={() => setAnswer(letter)}
                className={cn(
                  "flex w-full items-center gap-4 rounded-xl border p-4 min-h-[56px] text-left transition-all duration-150 ease-in-out",
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-card border-border hover:bg-primary/5"
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm font-semibold transition-all duration-150",
                    isSelected
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-secondary text-foreground"
                  )}
                >
                  {letter}
                </span>
                <span className={cn("text-sm", isSelected ? "text-primary-foreground" : "text-foreground")}>
                  {opt}
                </span>
              </button>
            );
          })}
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
