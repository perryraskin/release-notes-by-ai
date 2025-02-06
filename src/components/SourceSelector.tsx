import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SourceType = "commits" | "diffs";

interface SourceSelectorProps {
  value: SourceType;
  onChange: (value: SourceType) => void;
}

export function SourceSelector({ value, onChange }: SourceSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="source-type">Source Type</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="source-type">
          <SelectValue placeholder="Select source type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="commits">Commit Messages</SelectItem>
          <SelectItem value="diffs">Commit Diffs</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-sm text-gray-500">
        {value === "commits"
          ? "Generate release notes based on commit messages only"
          : "Generate detailed release notes by analyzing both commit messages and actual code changes"}
      </p>
    </div>
  );
}
