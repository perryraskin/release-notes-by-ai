import { useState } from "react";
import { GithubUrlInput } from "@/components/GithubUrlInput";
import { DateRangeSelector } from "@/components/DateRangeSelector";
import { ReleaseNotes } from "@/components/ReleaseNotes";
import { Button } from "@/components/ui/button";
import { parseGithubUrl, fetchCommits } from "@/lib/github";
import { generateReleaseNotes } from "@/lib/openai";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";

const Index = () => {
  const [url, setUrl] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [releaseNotes, setReleaseNotes] = useState<string>();
  const [urlError, setUrlError] = useState<string>();
  const { toast } = useToast();

  const handleSubmit = async () => {
    setUrlError(undefined);
    
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select both start and end dates",
        variant: "destructive",
      });
      return;
    }

    const repoInfo = parseGithubUrl(url);
    if (!repoInfo) {
      setUrlError("Invalid GitHub repository URL");
      return;
    }

    if (!localStorage.getItem('OPENAI_API_KEY')) {
      toast({
        title: "Error",
        description: "Please enter your OpenAI API key in the settings",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const commits = await fetchCommits(repoInfo.owner, repoInfo.repo, startDate, endDate);
      const notes = await generateReleaseNotes(commits.map(c => c.message));
      setReleaseNotes(notes);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate release notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            GitHub Release Notes Generator
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Generate beautiful release notes from your GitHub commits using AI
          </p>
        </div>

        <Card className="p-6 space-y-6">
          <GithubUrlInput
            value={url}
            onChange={setUrl}
            error={urlError}
          />
          
          <DateRangeSelector
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Release Notes"}
          </Button>
        </Card>

        {releaseNotes && <ReleaseNotes content={releaseNotes} />}
      </div>
    </div>
  );
};

export default Index;