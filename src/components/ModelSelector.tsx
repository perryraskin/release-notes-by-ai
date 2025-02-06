import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ModelType = "gpt-4o-mini" | "claude";

interface ModelSelectorProps {
  value: ModelType;
  onChange: (value: ModelType) => void;
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="model-type">AI Model</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="model-type">
          <SelectValue placeholder="Select AI model" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
          <SelectItem value="claude">Claude</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-sm text-gray-500">
        {value === "gpt-4o-mini"
          ? "Generate release notes using OpenAI's GPT-4 Mini model"
          : "Generate release notes using Anthropic's Claude model"}
      </p>
    </div>
  );
}
