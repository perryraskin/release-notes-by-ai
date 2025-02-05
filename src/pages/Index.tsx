import { useState } from "react";
import { GithubUrlInput } from "@/components/GithubUrlInput";
import { DateRangeSelector } from "@/components/DateRangeSelector";
import { ReleaseNotes } from "@/components/ReleaseNotes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  parseGithubUrl,
  fetchCommits,
  checkRepoVisibility,
} from "@/lib/github";
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
  const [githubToken, setGithubToken] = useState(
    localStorage.getItem("GITHUB_TOKEN") || ""
  );
  const { toast } = useToast();

  const handleGithubTokenChange = (token: string) => {
    setGithubToken(token);
    if (token) {
      localStorage.setItem("GITHUB_TOKEN", token);
    } else {
      localStorage.removeItem("GITHUB_TOKEN");
    }
  };

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

    if (!localStorage.getItem("OPENAI_API_KEY")) {
      toast({
        title: "Error",
        description: "Please enter your OpenAI API key in the settings",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Check repository visibility
      const { isPrivate, error } = await checkRepoVisibility(
        repoInfo.owner,
        repoInfo.repo
      );

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return;
      }

      if (isPrivate && !githubToken) {
        toast({
          title: "Error",
          description:
            "This is a private repository. Please provide a GitHub access token.",
          variant: "destructive",
        });
        return;
      }

      const commits = await fetchCommits(
        repoInfo.owner,
        repoInfo.repo,
        startDate,
        endDate
      );
      const notes = await generateReleaseNotes(commits.map((c) => c.message));
      setReleaseNotes(notes);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate release notes. Please try again.",
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
          <div className="space-y-4">
            <div>
              <label
                htmlFor="github-token"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                GitHub Access Token (required for private repositories)
              </label>
              <Input
                id="github-token"
                type="password"
                value={githubToken}
                onChange={(e) => handleGithubTokenChange(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="mt-1"
              />
              <p className="mt-1 text-sm text-gray-500">
                Your token will be stored locally and only used to access GitHub
                repositories
              </p>
            </div>

            <GithubUrlInput value={url} onChange={setUrl} error={urlError} />

            <DateRangeSelector
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
          </div>

          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? "Generating..." : "Generate Release Notes"}
          </Button>
        </Card>

        {releaseNotes && <ReleaseNotes content={releaseNotes} />}
      </div>
    </div>
  );
};

export default Index;
