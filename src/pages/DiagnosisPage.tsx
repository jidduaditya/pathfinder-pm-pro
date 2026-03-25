import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
