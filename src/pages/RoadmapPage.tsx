import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Check, ExternalLink, Pencil, HelpCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const TYPE_COLORS: Record<string, string> = {
  Article: "bg-primary/10 text-primary border-primary/30",
  Book: "bg-warning/10 text-warning border-warning/30",
  Framework: "bg-success/10 text-success border-success/30",
  Course: "bg-destructive/10 text-destructive border-destructive/30",
  Video: "bg-muted text-muted-foreground border-border",
};

const mockRoadmap = {
  role_name: "Data Product Manager",
  role_id: "1",
  stages: [
    {
      stage_number: 1,
      name: "Build your metrics foundation",
      duration: "2–3 weeks",
      status: "not_started" as StageStatus,
      goal: "Learn to define, measure, and communicate the right product metrics for data products.",
      resources: [
        { title: "Lean Analytics", type: "Book", url: "#" },
        { title: "How to Choose the Right Metrics", type: "Article", url: "#" },
        { title: "HEART Framework", type: "Framework", url: "#" },
        { title: "Metrics That Matter (Reforge)", type: "Course", url: "#" },
      ],
      practice: "Pick a data product you use daily. Define 3 success metrics and explain why each matters.",
      checkpoint: "Can you explain the difference between a vanity metric and an actionable metric using a real example?",
    },
    {
      stage_number: 2,
      name: "Master experimentation",
      duration: "2–3 weeks",
      status: "not_started" as StageStatus,
      goal: "Understand how to design, run, and interpret A/B tests for data-heavy products.",
      resources: [
        { title: "Trustworthy Online Controlled Experiments", type: "Book", url: "#" },
        { title: "Intro to A/B Testing (Udacity)", type: "Course", url: "#" },
        { title: "Statistical Significance Explained", type: "Article", url: "#" },
      ],
      practice: "Design an A/B test for a feature in a product you use. Define hypothesis, variants, sample size, and success criteria.",
      checkpoint: "How would you decide whether to ship a feature that shows a 2% lift but with p-value of 0.08?",
    },
    {
      stage_number: 3,
      name: "Learn data governance basics",
      duration: "1–2 weeks",
      status: "not_started" as const,
      goal: "Understand data privacy, access controls, and compliance as a product manager.",
      resources: [
        { title: "GDPR for Product Managers", type: "Article", url: "#" },
        { title: "Data Governance Fundamentals", type: "Video", url: "#" },
        { title: "India's DPDP Act Overview", type: "Article", url: "#" },
      ],
      practice: "Audit a feature you own. List all data it collects and whether each piece is necessary.",
      checkpoint: "If a user requests data deletion, what systems and processes need to be involved?",
    },
  ],
};

type StageStatus = "not_started" | "in_progress" | "complete";

const RoadmapPage = () => {
  const navigate = useNavigate();
  const { roadmapId } = useParams<{ roadmapId: string }>();
  const [stages, setStages] = useState(mockRoadmap.stages);
  const [openStages, setOpenStages] = useState<Set<number>>(new Set([1]));
  const [marking, setMarking] = useState<number | null>(null);

  const completedCount = stages.filter((s) => s.status === "complete").length;
  const hasCompletedAny = completedCount > 0;

  const toggleStage = (num: number) => {
    setOpenStages((prev) => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  };

  const markComplete = async (stageNumber: number) => {
    setMarking(stageNumber);
    try {
      const res = await apiFetch(`/api/roadmap/${roadmapId}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage_number: stageNumber }),
      });
      if (!res.ok) throw new Error();

      setStages((prev) =>
        prev.map((s) =>
          s.stage_number === stageNumber ? { ...s, status: "complete" as StageStatus } : s
        )
      );

      // Collapse completed, expand next
      setOpenStages((prev) => {
        const next = new Set(prev);
        next.delete(stageNumber);
        const nextStage = stages.find((s) => s.stage_number === stageNumber + 1);
        if (nextStage) next.add(nextStage.stage_number);
        return next;
      });
    } catch {
      toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setMarking(null);
    }
  };

  const statusLabel = (status: StageStatus) => {
    if (status === "complete") return "Complete";
    if (status === "in_progress") return "In progress";
    return "Not started";
  };

  const statusClasses = (status: StageStatus) => {
    if (status === "complete") return "border-success/30 bg-success/10 text-success";
    if (status === "in_progress") return "border-primary/30 bg-primary/10 text-primary";
    return "border-border text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl py-10 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Your {mockRoadmap.role_name} Roadmap</h1>
        <p className="mt-1 text-muted-foreground">Sequenced by your biggest gaps first.</p>

        {/* Progress */}
        <div className="mt-6 flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {completedCount} of {stages.length} stages complete
          </span>
          <Progress value={(completedCount / stages.length) * 100} className="h-2 flex-1" />
        </div>

        {/* Retake banner */}
        {hasCompletedAny && (
          <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-foreground">
              Ready to retest your knowledge? Retake the quiz to update your roadmap.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/roadmap/start?role_id=${mockRoadmap.role_id}`)}
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Retake quiz
            </Button>
          </div>
        )}

        {/* Stages */}
        <div className="mt-8 space-y-4">
          {stages.map((stage, idx) => {
            const isOpen = openStages.has(stage.stage_number);
            const isComplete = stage.status === "complete";
            const isLastStage = idx === stages.length - 1;

            return (
              <Collapsible
                key={stage.stage_number}
                open={isOpen}
                onOpenChange={() => toggleStage(stage.stage_number)}
              >
                <div
                  className={cn(
                    "rounded-lg border transition-all",
                    isComplete ? "border-success/20 bg-success/5 opacity-80" : "border-border bg-card"
                  )}
                >
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold",
                          isComplete
                            ? "border-success bg-success text-success-foreground"
                            : "border-border text-muted-foreground"
                        )}
                      >
                        {isComplete ? <Check className="h-3.5 w-3.5" /> : stage.stage_number}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-card-foreground">
                          Stage {stage.stage_number} — {stage.name}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{stage.duration}</span>
                          <Badge variant="outline" className={cn("text-[10px]", statusClasses(stage.status))}>
                            {statusLabel(stage.status)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                        isOpen && "rotate-180"
                      )}
                    />
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="border-t border-border px-4 pb-5 pt-4 space-y-5">
                      {/* Goal */}
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Goal</h4>
                        <p className="mt-1 text-sm text-foreground">{stage.goal}</p>
                      </div>

                      {/* Resources */}
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Resources</h4>
                        <ul className="mt-2 space-y-2">
                          {stage.resources.map((r) => (
                            <li key={r.title} className="flex items-center justify-between rounded-md border border-border p-3">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={cn("text-[10px]", TYPE_COLORS[r.type] || "")}>
                                  {r.type}
                                </Badge>
                                <span className="text-sm text-foreground">{r.title}</span>
                              </div>
                              <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                                Open <ExternalLink className="h-3 w-3" />
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Practice */}
                      <div className="rounded-md border border-primary/20 bg-primary/5 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                          <Pencil className="h-4 w-4 text-primary" /> Try this
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{stage.practice}</p>
                      </div>

                      {/* Checkpoint */}
                      <div className="rounded-md border border-warning/20 bg-warning/5 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                          <HelpCircle className="h-4 w-4 text-warning" /> Ask yourself
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{stage.checkpoint}</p>
                      </div>

                      {/* Mark complete */}
                      {!isComplete && (
                        <Button
                          variant="outline"
                          className="w-full border-success/40 text-success hover:bg-success/10"
                          onClick={() => markComplete(stage.stage_number)}
                          disabled={marking === stage.stage_number}
                        >
                          {marking === stage.stage_number ? "Saving…" : "Mark Stage Complete ✓"}
                        </Button>
                      )}

                      {/* Coach CTA on last stage */}
                      {isLastStage && (
                        <Button variant="outline" className="w-full" onClick={() => navigate("/coach")}>
                          Test your thinking with the Coach →
                        </Button>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoadmapPage;
