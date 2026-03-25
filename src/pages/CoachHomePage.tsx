import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, GitBranch, FileText, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const PM_ROLES = [
  "Technical PM", "Growth PM", "AI PM", "ML PM", "DevOps PM",
  "Data PM", "Platform PM", "Product Marketing Manager",
  "Digital PM", "Enterprise/B2B PM", "Consumer/B2C PM",
];

const MODES = [
  { id: "case_study", label: "Case Study", description: "Working through a product case study and want feedback on your approach.", icon: BookOpen },
  { id: "product_decision", label: "Product Decision", description: "Have a real or hypothetical product decision to think through.", icon: GitBranch },
  { id: "feature_brief", label: "Feature Brief / PRD", description: "Written a feature brief and want feedback on the thinking behind it.", icon: FileText },
];

type PastSession = {
  id: string;
  title: string;
  mode: string;
  role: string;
  date: string;
  main_gap: string;
};

const mockHistory: PastSession[] = [
  { id: "cs_001", title: "Pricing strategy for freemium conversion", mode: "Product Decision", role: "Growth PM", date: "2024-03-18", main_gap: "Didn't consider willingness-to-pay segmentation" },
  { id: "cs_002", title: "Onboarding redesign case study", mode: "Case Study", role: "Data PM", date: "2024-03-15", main_gap: "Missing success metrics for the new flow" },
];

const CoachHomePage = () => {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState(PM_ROLES[0]);
  const [inputMethod, setInputMethod] = useState<"type" | "voice">("type");
  const [loading, setLoading] = useState(false);
  const [history] = useState<PastSession[]>(mockHistory);

  const handleStart = async () => {
    if (!selectedMode) return;
    setLoading(true);
    try {
      const res = await apiFetch("/api/coach/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pm_role_id: selectedRole, mode: selectedMode, input_method: inputMethod }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      localStorage.setItem("pmgps_active_coach_session", data.session_id);
      navigate(`/coach/session/${data.session_id}`);
    } catch {
      toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl py-10 animate-fade-in">
        {/* Start new session */}
        <h1 className="text-2xl font-bold text-foreground">Think out loud. Get specific feedback.</h1>
        <p className="mt-2 text-muted-foreground">
          Walk me through your thinking on a product problem. I'll tell you exactly what was strong and what broke down.
        </p>

        {/* Mode cards */}
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {MODES.map((mode) => {
            const Icon = mode.icon;
            const active = selectedMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={cn(
                  "rounded-lg border p-4 text-left transition-all",
                  active ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card hover:border-primary/40"
                )}
              >
                <Icon className={cn("h-5 w-5 mb-2", active ? "text-primary" : "text-muted-foreground")} />
                <p className="text-sm font-semibold text-card-foreground">{mode.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{mode.description}</p>
              </button>
            );
          })}
        </div>

        {/* Role selector */}
        <div className="mt-6">
          <label className="text-sm font-medium text-foreground">Coaching me as a…</label>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="mt-1.5 w-full sm:w-72">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PM_ROLES.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Input method toggle */}
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => setInputMethod("type")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
              inputMethod === "type" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            Type
          </button>
          <button
            onClick={() => setInputMethod("voice")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
              inputMethod === "voice" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            Voice
          </button>
        </div>

        <Button className="mt-6" onClick={handleStart} disabled={!selectedMode || loading}>
          {loading ? "Starting…" : "Start session →"}
        </Button>

        {/* Past sessions */}
        {history.length > 0 && (
          <section className="mt-14">
            <h2 className="text-lg font-semibold text-foreground">Previous sessions</h2>
            <div className="mt-4 space-y-3">
              {history.map((s) => (
                <button
                  key={s.id}
                  onClick={() => navigate(`/coach/session/${s.id}`)}
                  className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-card-foreground truncate">{s.title}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">{s.mode}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{s.role}</Badge>
                      <span className="text-[10px] text-muted-foreground">{s.date}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground truncate">{s.main_gap}</p>
                  </div>
                  <ArrowRight className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default CoachHomePage;
