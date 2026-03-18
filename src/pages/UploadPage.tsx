import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, X, FileText, Link, Type, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface UploadSectionProps {
  label: string;
  files: File[];
  setFiles: (files: File[]) => void;
  driveLink: string;
  setDriveLink: (link: string) => void;
  pastedText: string;
  setPastedText: (text: string) => void;
  processing: boolean;
}

const UploadSection = ({
  label, files, setFiles, driveLink, setDriveLink, pastedText, setPastedText, processing
}: UploadSectionProps) => {
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const valid = Array.from(newFiles).filter((f) => {
      if (f.size > 10 * 1024 * 1024) { toast.error(`${f.name} is too large (max 10 MB)`); return false; }
      if (!/\.(pdf|docx|txt)$/i.test(f.name)) { toast.error(`${f.name} is not a supported format`); return false; }
      return true;
    });
    if (files.length + valid.length > 5) { toast.error("Max 5 files allowed"); return; }
    setFiles([...files, ...valid]);
  }, [files, setFiles]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="upload" className="flex-1 gap-1.5"><Upload className="h-3.5 w-3.5" />Upload file</TabsTrigger>
          <TabsTrigger value="drive" className="flex-1 gap-1.5"><Link className="h-3.5 w-3.5" />Google Drive</TabsTrigger>
          <TabsTrigger value="paste" className="flex-1 gap-1.5"><Type className="h-3.5 w-3.5" />Paste text</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-3">
          <div
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
              dragOver ? "border-primary bg-primary/5" : "border-border"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Drop your CV here or click to browse</p>
            <p className="mt-1 text-xs text-muted-foreground">PDF, DOCX, TXT — Max 10 MB</p>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              multiple
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={(e) => handleFiles(e.target.files)}
              style={{ position: "relative", marginTop: 8 }}
            />
          </div>
          {files.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {files.map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs text-foreground">
                  <FileText className="h-3 w-3" />
                  {f.name}
                  <button onClick={() => setFiles(files.filter((_, j) => j !== i))}><X className="h-3 w-3 text-muted-foreground hover:text-foreground" /></button>
                </span>
              ))}
            </div>
          )}
          {processing && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Reading your document...
            </div>
          )}
        </TabsContent>

        <TabsContent value="drive" className="mt-3 space-y-2">
          <Input
            placeholder="Paste your Google Drive link here"
            value={driveLink}
            onChange={(e) => setDriveLink(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Make sure the file is set to "Anyone with the link can view".</p>
        </TabsContent>

        <TabsContent value="paste" className="mt-3 space-y-2">
          <Textarea
            placeholder="Paste your CV content here"
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value.slice(0, 10000))}
            rows={8}
          />
          <p className="text-right text-xs text-muted-foreground">{pastedText.length} / 10,000</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const UploadPage = () => {
  const navigate = useNavigate();
  const [cvFiles, setCvFiles] = useState<File[]>([]);
  const [cvDriveLink, setCvDriveLink] = useState("");
  const [cvText, setCvText] = useState("");
  const [clFiles, setClFiles] = useState<File[]>([]);
  const [clDriveLink, setClDriveLink] = useState("");
  const [clText, setClText] = useState("");

  const hasCV = cvFiles.length > 0 || cvDriveLink.trim() !== "" || cvText.trim() !== "";

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl py-12 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Tell us about yourself</h1>
        <p className="mt-1 text-muted-foreground">Start by uploading your CV. Cover letters are optional but help.</p>

        <div className="mt-8 space-y-10">
          <UploadSection
            label="CV / Resume *"
            files={cvFiles} setFiles={setCvFiles}
            driveLink={cvDriveLink} setDriveLink={setCvDriveLink}
            pastedText={cvText} setPastedText={setCvText}
            processing={false}
          />

          <UploadSection
            label="Cover letter (optional)"
            files={clFiles} setFiles={setClFiles}
            driveLink={clDriveLink} setDriveLink={setClDriveLink}
            pastedText={clText} setPastedText={setClText}
            processing={false}
          />

          <Button
            size="lg"
            className="w-full sm:w-auto"
            disabled={!hasCV}
            onClick={() => navigate("/questionnaire")}
          >
            Continue to questionnaire →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
