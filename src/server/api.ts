import { GenerateOptions } from "../lib/openai";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export const generateReleaseNotesServer = async (
  type: GenerateOptions["type"],
  model: GenerateOptions["model"],
  data: GenerateOptions["data"],
  openaiKey?: string,
  anthropicKey?: string
): Promise<string> => {
  const basePrompt =
    type === "commits"
      ? `Given these git commits, generate concise and friendly release notes. Use appropriate emojis for different types of changes. Group similar changes together:

${data.map((d) => d.message).join("\n")}`
      : `Given these git commits and their corresponding diffs, analyze both the commit messages and the actual code changes to generate detailed release notes. Use the commit messages for context and the diffs to understand the specific changes made. Use appropriate emojis for different types of changes. Group similar changes together.

${data
  .map((d) => `Commit Message: ${d.message}\n\nCode Changes:\n${d.diff}\n---\n`)
  .join("\n")}`;

  const prompt = `${basePrompt}\n\nFormat the response in markdown.`;

  if (model === "claude") {
    const apiKey = getApiKey("ANTHROPIC_API_KEY", anthropicKey);
    if (!apiKey) {
      throw new Error("Anthropic API key is required");
    }
    const client = new Anthropic({
      apiKey,
    });

    const message = await client.messages.create({
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
      model: "claude-3-5-haiku-20241022",
    });

    console.log("Anthropic response", message);

    if (!message.content || message.content.length === 0) {
      throw new Error(
        "Failed to generate release notes: " + JSON.stringify(message)
      );
    }

    return message.content[0].type === "text" ? message.content[0].text : "";
  } else {
    const apiKey = getApiKey("OPENAI_API_KEY", openaiKey);
    if (!apiKey) {
      throw new Error("OpenAI API key is required");
    }
    const openai = new OpenAI({
      apiKey,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    if (!response.choices[0].message.content) {
      throw new Error("Failed to generate release notes");
    }

    return response.choices[0].message.content;
  }
};

// Helper function to get API keys with fallback
const getApiKey = (envKey: string, localKey?: string) => {
  const prefixedKey = `VITE_${envKey}`;
  const key = process.env[prefixedKey] || localKey;
  return key;
};

export const checkRepoVisibilityServer = async (
  owner: string,
  repo: string,
  githubToken?: string
): Promise<{ isPrivate: boolean; error?: string }> => {
  try {
    const token = getApiKey("GITHUB_TOKEN", githubToken);
    const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
      ...authHeader,
    };

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return {
          isPrivate: true,
          error:
            "Repository not found. It might be private and require authentication.",
        };
      }
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();
    return { isPrivate: data.private };
  } catch (error) {
    return {
      isPrivate: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
  };
}

export const fetchCommitsServer = async (
  owner: string,
  repo: string,
  startDate: Date,
  endDate: Date,
  githubToken?: string
): Promise<Array<{ message: string }>> => {
  const token = getApiKey("GITHUB_TOKEN", githubToken);
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    ...authHeader,
  };

  const since = startDate.toISOString();
  const until = endDate.toISOString();

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/commits?since=${since}&until=${until}`,
    { headers }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  const commits = await response.json();
  return commits.map((commit: GitHubCommit) => ({
    message: commit.commit.message,
  }));
};

export const fetchCommitDiffsServer = async (
  owner: string,
  repo: string,
  startDate: Date,
  endDate: Date,
  githubToken?: string
): Promise<Array<{ message: string; diff: string }>> => {
  const token = getApiKey("GITHUB_TOKEN", githubToken);
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    ...authHeader,
  };

  const since = startDate.toISOString();
  const until = endDate.toISOString();

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/commits?since=${since}&until=${until}`,
    { headers }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  const commits = await response.json();

  const commitsWithDiffs = await Promise.all(
    commits.map(async (commit: GitHubCommit) => {
      const diffResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits/${commit.sha}`,
        {
          headers: {
            ...headers,
            Accept: "application/vnd.github.v3.diff",
          },
        }
      );

      if (!diffResponse.ok) {
        throw new Error(`GitHub API error: ${diffResponse.statusText}`);
      }

      const diff = await diffResponse.text();
      return {
        message: commit.commit.message,
        diff,
      };
    })
  );

  return commitsWithDiffs;
};
