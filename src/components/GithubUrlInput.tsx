import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GithubUrlInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const GithubUrlInput = ({ value, onChange, error }: GithubUrlInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="github-url">GitHub Repository URL</Label>
      <Input
        id="github-url"
        placeholder="https://github.com/owner/repo"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={error ? "border-red-500" : ""}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};