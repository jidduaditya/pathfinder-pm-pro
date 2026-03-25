import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock quiz questions with correct answers for review
const mockQuizQuestions = [
  { id: "q1", text: "What is the primary goal of a product roadmap?", options: ["List all features to build", "Communicate strategic direction and priorities", "Track engineering velocity", "Assign tasks to team members"], correct: "B", explanation: "A product roadmap communicates strategic direction and priorities, aligning the team around what matters most." },
  { id: "q2", text: "Your CEO wants to launch a feature next week that you believe needs more user research. What is your best first step?", options: ["Agree and start building immediately", "Refuse and escalate to the board", "Present data on user research gaps and propose a compromise timeline", "Delegate the decision to your engineering lead"], correct: "C", explanation: "Presenting data-backed concerns with a compromise shows leadership while respecting the urgency." },
  { id: "q3", text: "Which metric best measures product-market fit for a B2B SaaS product?", options: ["Monthly Active Users", "Net Revenue Retention", "Page views", "Number of features shipped"], correct: "B", explanation: "Net Revenue Retention captures whether existing customers find enough value to stay and expand — the clearest signal of product-market fit in B2B SaaS." },
  { id: "q4", text: "When prioritising features with limited engineering resources, which approach is most effective?", options: ["Build whatever the loudest stakeholder requests", "Use an impact vs effort framework to rank opportunities", "Ship the easiest features first to show progress", "Wait until more resources are available"], correct: "B", explanation: "An impact vs effort framework helps you make trade-offs transparently and maximise value delivered per unit of effort." },
  { id: "q5", text: "What is a common anti-pattern when writing user stories?", options: ["Including acceptance criteria", "Writing from the user's perspective", "Describing implementation details instead of outcomes", "Keeping stories small and testable"], correct: "C", explanation: "User stories should describe outcomes and user value, not prescribe technical implementation." },
  { id: "q6", text: "A recently launched feature has a 2% adoption rate after one month. What should you do first?", options: ["Remove the feature immediately", "Analyse user behaviour data to understand why adoption is low", "Double the marketing budget for the feature", "Rebuild the feature from scratch with new technology"], correct: "B", explanation: "Before taking action, you need to understand the root cause — is it discoverability, usability, or lack of need?" },
  { id: "q7", text: "When conducting A/B tests, what determines the minimum sample size?", options: ["Number of engineers available", "Minimum detectable effect and statistical significance level", "How long the CEO is willing to wait", "The number of features being tested"], correct: "B", explanation: "Sample size is determined by the minimum detectable effect size and the desired statistical significance level." },
  { id: "q8", text: "How should you define success for a new onboarding flow?", options: ["By counting total signups", "By measuring activation rate and time-to-value", "By the number of onboarding screens", "By surveying the design team"], correct: "B", explanation: "Activation rate and time-to-value directly measure whether users are reaching their 'aha moment' efficiently." },
  { id: "q9", text: "What is the main benefit of using a jobs-to-be-done framework?", options: ["It replaces the need for user interviews", "It focuses on the underlying need rather than the solution", "It simplifies engineering estimates", "It eliminates the need for competitive analysis"], correct: "B", explanation: "JTBD shifts focus from features to the underlying problem users are trying to solve." },
  { id: "q10", text: "Your data team tells you the key metric you've been optimising is a vanity metric. What do you do?", options: ["Ignore them and continue optimising", "Work with the data team to identify a metric tied to real business outcomes", "Switch to tracking revenue only", "Stop measuring metrics altogether"], correct: "B", explanation: "Collaborating with the data team to find a meaningful metric shows intellectual honesty and data maturity." },
];

const LETTERS = ["A", "B", "C", "D"] as const;

// Mock data
const mockDiagnosis = {
  role_name: "Data Product Manager",
  roadmap_id: "rm_001",
  topic_scores: [
    { topic: "Metrics & KPIs", score: 82 },
    { topic: "Data Pipelines", score: 71 },
    { topic: "Stakeholder Management", score: 65 },
    { topic: "Experimentation", score: 48 },
    { topic: "Data Governance", score: 35 },
  ],
  strengths: [
    { topic: "Metrics & KPIs", explanation: "You demonstrated strong intuition for choosing the right success metrics and connecting them to business outcomes." },
    { topic: "Data Pipelines", explanation: "You clearly understand how data flows through systems and can reason about trade-offs in pipeline design." },
  ],
  weaknesses: [
    { topic: "Experimentation", specific_gap: "Your approach to A/B testing lacked consideration for sample size and statistical significance." },
    { topic: "Data Governance", specific_gap: "You didn't address data privacy, access controls, or compliance considerations in your answers." },
  ],
};

const DiagnosisPage = () => {
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId: string }>();
  const [data] = useState(mockDiagnosis);
  const [answersExpanded, setAnswersExpanded] = useState(false);

  // Load saved answers from localStorage
  const [userAnswers] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(`pmgps_quiz_answers_${quizId}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (data.roadmap_id) {
      localStorage.setItem("pmgps_roadmap_id", data.roadmap_id);
    }
  }, [data.roadmap_id]);

  const scoreColor = (score: number) => {
    if (score >= 70) return "bg-success/20 text-success";
    if (score >= 40) return "bg-warning/20 text-warning";
    return "bg-destructive/20 text-destructive";
  };

  const barColor = (score: number) => {
    if (score >= 70) return "bg-success";
    if (score >= 40) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl py-10 animate-fade-in">
        {/* Strengths */}
        <section className="rounded-lg border border-success/20 bg-success/5 p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Your strengths for {data.role_name}
          </h2>
          {data.strengths.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Complete more stages of your roadmap and retake the quiz to unlock strengths.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {data.strengths.map((s) => (
                <div key={s.topic} className="rounded-md border border-success/20 bg-background p-4">
                  <p className="text-sm font-semibold text-foreground">{s.topic}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.explanation}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Topic scores */}
        <section className="mt-8">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Topic scores
          </h3>
          <div className="space-y-3">
            {data.topic_scores.map((t) => (
              <div key={t.topic} className="flex items-center gap-4">
                <span className="w-40 shrink-0 text-sm text-foreground">{t.topic}</span>
                <div className="flex-1 h-3 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", barColor(t.score))}
                    style={{ width: `${t.score}%` }}
                  />
                </div>
                <span className={cn("text-xs font-semibold rounded px-2 py-0.5", scoreColor(t.score))}>
                  {t.score}%
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Your answers - expandable */}
        <section className="mt-8">
          <button
            type="button"
            onClick={() => setAnswersExpanded((v) => !v)}
            className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-secondary/50"
          >
            <span className="text-sm font-semibold text-foreground">
              {answersExpanded ? "Hide answers" : "Review your answers"}
            </span>
            {answersExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {answersExpanded && (
            <div className="mt-3 space-y-4 animate-fade-in">
              {mockQuizQuestions.map((q, qIndex) => {
                const userAnswer = userAnswers[q.id] || "";
                const isCorrect = userAnswer === q.correct;
                const correctIndex = LETTERS.indexOf(q.correct as typeof LETTERS[number]);

                return (
                  <div key={q.id} className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-foreground">
                        {qIndex + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{q.text}</p>
                        <div className="mt-3 space-y-2">
                          {q.options.map((opt, i) => {
                            const letter = LETTERS[i];
                            const isUserChoice = letter === userAnswer;
                            const isCorrectOption = letter === q.correct;

                            return (
                              <div
                                key={letter}
                                className={cn(
                                  "flex items-center gap-3 rounded-lg border p-3 text-sm",
                                  isUserChoice && isCorrect
                                    ? "border-success/40 bg-success/10"
                                    : isUserChoice && !isCorrect
                                    ? "border-destructive/40 bg-destructive/10"
                                    : isCorrectOption && !isCorrect
                                    ? "border-success/40 bg-success/5"
                                    : "border-border bg-background"
                                )}
                              >
                                <span
                                  className={cn(
                                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold",
                                    isUserChoice && isCorrect
                                      ? "bg-success text-success-foreground"
                                      : isUserChoice && !isCorrect
                                      ? "bg-destructive text-destructive-foreground"
                                      : isCorrectOption && !isCorrect
                                      ? "bg-success/20 text-success"
                                      : "bg-secondary text-muted-foreground"
                                  )}
                                >
                                  {letter}
                                </span>
                                <span className={cn(
                                  "flex-1",
                                  isUserChoice || (isCorrectOption && !isCorrect)
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                                )}>
                                  {opt}
                                </span>
                                {isUserChoice && isCorrect && (
                                  <Check className="h-4 w-4 text-success" />
                                )}
                                {isUserChoice && !isCorrect && (
                                  <X className="h-4 w-4 text-destructive" />
                                )}
                                {isCorrectOption && !isCorrect && !isUserChoice && (
                                  <Check className="h-4 w-4 text-success" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {!isCorrect && (
                          <p className="mt-3 text-xs text-muted-foreground">
                            <span className="font-semibold text-success">Correct: {q.correct}.</span>{" "}
                            {q.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Weaknesses */}
        <section className="mt-8 rounded-lg border border-warning/20 bg-warning/5 p-6">
          <h2 className="text-lg font-semibold text-foreground">Areas to build</h2>
          <div className="mt-4 space-y-3">
            {data.weaknesses.map((w) => (
              <div key={w.topic} className="rounded-md border border-warning/20 bg-background p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">{w.topic}</p>
                  <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                    This is in your roadmap
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{w.specific_gap}</p>
              </div>
            ))}
          </div>
        </section>

        <Button className="mt-10 w-full sm:w-auto" onClick={() => navigate(`/roadmap/${data.roadmap_id}`)}>
          See my personalised roadmap →
        </Button>
      </div>
    </div>
  );
};

export default DiagnosisPage;
