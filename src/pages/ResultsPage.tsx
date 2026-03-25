import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, RotateCcw, ExternalLink, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

// Mock data
const mockResults = {
  excellent: [
    { id: "1", role: "Data Product Manager", score: 87, rationale: "Strong data background + 6 years in analytics products" },
    { id: "2", role: "Technical PM", score: 82, rationale: "Solid engineering experience with proven cross-functional collaboration" },
  ],
  needWork: [
    { id: "3", role: "AI PM", score: 64, rationale: "Good technical base but limited hands-on ML experience" },
  ],
  longShot: [
    { id: "4", role: "Growth PM", score: 38, rationale: "Limited marketing and experimentation experience" },
  ],
};

const mockSkills: Record<string, { have: string[]; mustHave: string[]; goodToHave: string[] }> = {
  "1": { have: ["SQL", "Data Analysis", "Stakeholder Management", "A/B Testing", "Roadmap Planning"], mustHave: ["Data Governance", "ML Model Evaluation"], goodToHave: ["dbt", "Looker"] },
  "2": { have: ["System Design", "API Design", "Agile", "Technical Specs"], mustHave: ["Cloud Architecture"], goodToHave: ["CI/CD", "Monitoring"] },
  "3": { have: ["Python", "Data Pipelines"], mustHave: ["ML Ops", "Model Training", "AI Ethics"], goodToHave: ["LLM Fine-tuning", "Prompt Engineering"] },
  "4": { have: ["Analytics"], mustHave: ["Growth Loops", "Funnel Optimization", "SEO/SEM", "Retention Strategies"], goodToHave: ["Paid Acquisition", "Viral Mechanics"] },
};

const mockCompanies: Record<string, Array<{ name: string; industry: string; size: string; ready: boolean; url: string }>> = {
  "1": [
    { name: "Razorpay", industry: "Fintech", size: "Large", ready: true, url: "#" },
    { name: "Swiggy", industry: "E-commerce", size: "Large", ready: true, url: "#" },
    { name: "Fractal Analytics", industry: "SaaS", size: "Mid-size", ready: false, url: "#" },
  ],
  "2": [
    { name: "Postman", industry: "SaaS", size: "Large", ready: true, url: "#" },
    { name: "Hasura", industry: "SaaS", size: "Mid-size", ready: true, url: "#" },
  ],
  "3": [
    { name: "Haptik", industry: "AI", size: "Mid-size", ready: false, url: "#" },
  ],
  "4": [],
};

type RoleCard = { id: string; role: string; score: number; rationale: string };

const ScoreCard = ({ card, selected, onClick }: { card: RoleCard; selected: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full rounded-lg border p-4 text-left transition-all",
      selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card hover:border-primary/40"
    )}
  >
    <p className="text-sm font-semibold text-card-foreground">{card.role}</p>
    <p className="mt-1 text-2xl font-bold text-primary">{card.score}%</p>
    <p className="mt-1 text-xs text-muted-foreground">{card.rationale}</p>
  </button>
);

const ResultsPage = () => {
  const navigate = useNavigate();
  const allCards = [...mockResults.excellent, ...mockResults.needWork, ...mockResults.longShot];
  const [selectedId, setSelectedId] = useState(allCards[0]?.id || "");
  const selected = allCards.find((c) => c.id === selectedId)!;
  const skills = mockSkills[selectedId];
  const companies = mockCompanies[selectedId] || [];
  const hasAllMustHave = skills?.mustHave.length === 0;

  const renderColumn = (title: string, emoji: string, cards: RoleCard[]) => {
    if (cards.length === 0) return null;
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">{emoji} {title}</h3>
        {cards.map((c) => (
          <ScoreCard key={c.id} card={c} selected={selectedId === c.id} onClick={() => setSelectedId(c.id)} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl py-10 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-foreground">Your results</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Download className="mr-1.5 h-3.5 w-3.5" /> Download results
            </Button>
            <Button variant="outline" size="sm" onClick={() => { localStorage.removeItem("session_id"); navigate("/upload"); }}>
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Start over
            </Button>
          </div>
        </div>

        {/* Panel 1 — Role Matches */}
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">Here's where you fit</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-3">
            {renderColumn("Excellent Match", "🟢", mockResults.excellent)}
            {renderColumn("Need Some Work", "🟡", mockResults.needWork)}
            {renderColumn("Long Shot", "🔴", mockResults.longShot)}
          </div>
        </section>

        {/* Panel 2 — Skills */}
        <section className="mt-14">
          <h2 className="text-lg font-semibold text-foreground">Your skills for {selected.role}</h2>

          {hasAllMustHave && (
            <div className="mt-3 rounded-md border border-success/30 bg-success/5 px-4 py-2 text-sm text-success">
              You already have all the must-have skills for this role.
            </div>
          )}

          <div className="mt-4 grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">You already have</h3>
              <div className="flex flex-wrap gap-2">
                {skills?.have.map((s) => (
                  <Badge key={s} variant="outline" className="border-success/40 bg-success/10 text-success">{s}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">Skills to build</h3>
              {skills?.mustHave.length > 0 && (
                <div className="mb-3">
                  <span className="mb-1.5 block text-xs text-muted-foreground">Must-have</span>
                  <div className="flex flex-wrap gap-2">
                    {skills.mustHave.map((s) => (
                      <Badge key={s} variant="outline" className="border-warning/40 bg-warning/10 text-warning">
                        {s} <span className="ml-1 text-[10px] opacity-70">required</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {skills?.goodToHave.length > 0 && (
                <div>
                  <span className="mb-1.5 block text-xs text-muted-foreground">Good-to-have</span>
                  <div className="flex flex-wrap gap-2">
                    {skills.goodToHave.map((s) => (
                      <Badge key={s} variant="outline" className="border-border text-muted-foreground">
                        {s} <span className="ml-1 text-[10px] opacity-70">optional</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Panel 3 — Companies */}
        <section className="mt-14 pb-16">
          <h2 className="text-lg font-semibold text-foreground">Companies hiring for {selected.role}</h2>

          {companies.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">We're still building this list for your region. Check back soon.</p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {companies.map((c) => (
                <div key={c.name} className="flex items-start justify-between rounded-lg border border-border bg-card p-4">
                  <div>
                    <p className="font-semibold text-card-foreground">{c.name}</p>
                    <div className="mt-1.5 flex gap-2">
                      <Badge variant="secondary" className="text-xs">{c.industry}</Badge>
                      <Badge variant="secondary" className="text-xs">{c.size}</Badge>
                    </div>
                    <Badge className={cn("mt-2", c.ready ? "bg-success/10 text-success border-success/30" : "bg-warning/10 text-warning border-warning/30")} variant="outline">
                      {c.ready ? "Apply now" : "Apply after upskilling"}
                    </Badge>
                  </div>
                  <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                    View careers <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ResultsPage;
