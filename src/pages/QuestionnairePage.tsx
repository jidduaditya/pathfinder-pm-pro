import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ChipSelect from "@/components/ChipSelect";
import SegmentedControl from "@/components/SegmentedControl";
import { cn } from "@/lib/utils";

const PM_ARCHETYPES = [
  "Technical PM", "Growth PM", "AI PM", "ML PM", "DevOps PM", "Data PM",
  "Platform PM", "Product Marketing Manager", "Digital PM", "Enterprise/B2B PM", "Consumer/B2C PM",
];

const QuestionnairePage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  // Page 1
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [companyTypes, setCompanyTypes] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);

  // Page 2
  const [writesCode, setWritesCode] = useState("");
  const [techComfort, setTechComfort] = useState(0);
  const [aiExposure, setAiExposure] = useState("");
  const [roadmapExp, setRoadmapExp] = useState("");

  // Page 3
  const [archetypes, setArchetypes] = useState<string[]>([]);
  const [companyStage, setCompanyStage] = useState<string[]>([]);
  const [geography, setGeography] = useState("");
  const [openToDomain, setOpenToDomain] = useState("");

  const canProceed = page === 0 ? role.trim() !== "" && experience !== "" : true;

  const handleNext = () => {
    if (page < 2) {
      setPage(page + 1);
    } else {
      navigate("/processing");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl py-12 animate-fade-in">
        {/* Progress */}
        <div className="mb-10 flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                i <= page ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              )}>
                {i + 1}
              </div>
              {i < 2 && <div className={cn("h-0.5 w-12 transition-colors", i < page ? "bg-primary" : "bg-border")} />}
            </div>
          ))}
          <span className="ml-3 text-sm text-muted-foreground">Page {page + 1} of 3</span>
        </div>

        {page === 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Your background</h2>

            <div className="space-y-2">
              <label className="text-sm font-medium">Current role *</label>
              <Input placeholder="e.g. Software Engineer" value={role} onChange={(e) => setRole(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Total years of experience *</label>
              <SegmentedControl options={["0–2", "3–5", "6–10", "10+"]} value={experience} onChange={setExperience} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Types of companies worked at</label>
              <ChipSelect options={["Startup", "Mid-size", "Large", "Enterprise"]} selected={companyTypes} onChange={setCompanyTypes} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Industries worked in</label>
              <ChipSelect options={["Fintech", "Healthtech", "SaaS", "E-commerce", "Edtech", "Logistics", "Other"]} selected={industries} onChange={setIndustries} />
            </div>
          </div>
        )}

        {page === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Your skills and exposure</h2>

            <div className="space-y-2">
              <label className="text-sm font-medium">Do you write code in your current role?</label>
              <SegmentedControl options={["Yes", "Sometimes", "No"]} value={writesCode} onChange={setWritesCode} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">How comfortable are you reading technical specs?</label>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground whitespace-nowrap">Not at all</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setTechComfort(n)}
                      className={cn(
                        "h-10 w-10 rounded-md border text-sm font-medium transition-colors",
                        techComfort === n
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-foreground hover:border-primary/50"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">Very comfortable</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Have you worked with AI/ML tools or features professionally?</label>
              <SegmentedControl options={["None", "Basic familiarity", "Used in work", "Built AI features"]} value={aiExposure} onChange={setAiExposure} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Have you managed or contributed to a product roadmap?</label>
              <SegmentedControl options={["Yes", "No", "Partially"]} value={roadmapExp} onChange={setRoadmapExp} />
            </div>
          </div>
        )}

        {page === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Your preferences</h2>

            <div className="space-y-2">
              <label className="text-sm font-medium">Which PM archetypes interest you most?</label>
              <ChipSelect options={PM_ARCHETYPES} selected={archetypes} onChange={setArchetypes} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">What company stage do you prefer?</label>
              <ChipSelect options={["Seed", "Series A", "Series B", "Growth", "Public"]} selected={companyStage} onChange={setCompanyStage} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">What geography are you targeting?</label>
              <Select value={geography} onValueChange={setGeography}>
                <SelectTrigger><SelectValue placeholder="Select a region" /></SelectTrigger>
                <SelectContent>
                  {["Pan-India", "Bengaluru", "Mumbai", "Delhi NCR", "Pune", "Hyderabad", "Remote", "Other"].map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Are you open to roles outside your current domain?</label>
              <SegmentedControl options={["Yes", "Open to it", "Prefer to stay in domain"]} value={openToDomain} onChange={setOpenToDomain} />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-10 flex justify-between">
          <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page === 0}>
            Back
          </Button>
          <Button onClick={handleNext} disabled={!canProceed}>
            {page === 2 ? "See my results →" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionnairePage;
