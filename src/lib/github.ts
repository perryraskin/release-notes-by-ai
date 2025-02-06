import { Octokit } from "@octokit/rest";

const octokit = new Octokit();

export interface Commit {
  sha: string;
  message: string;
  date: string;
  author: string;
  diff?: string;
}

export interface RepoInfo {
  owner: string;
  repo: string;
}

export const parseGithubUrl = (url: string): RepoInfo | null => {
  try {
    const parsed = new URL(url);
    const [, owner, repo] = parsed.pathname.split("/");
    return owner && repo ? { owner, repo } : null;
  } catch {
    return null;
  }
};

export const checkRepoVisibility = async (
  owner: string,
  repo: string
): Promise<{ isPrivate: boolean; error?: string }> => {
  try {
    const token = localStorage.getItem("GITHUB_TOKEN");
    const response = await fetch("/api/github/visibility", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        owner,
        repo,
        githubToken: token,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    return {
      isPrivate: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const fetchCommits = async (
  owner: string,
  repo: string,
  startDate: Date,
  endDate: Date
): Promise<Array<{ message: string }>> => {
  const token = localStorage.getItem("GITHUB_TOKEN");
  const response = await fetch("/api/github/commits", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      owner,
      repo,
      startDate,
      endDate,
      githubToken: token,
    }),
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.statusText}`);
  }

  const { commits } = await response.json();
  return commits;
};

export const fetchCommitDiffs = async (
  owner: string,
  repo: string,
  startDate: Date,
  endDate: Date
): Promise<Array<{ message: string; diff: string }>> => {
  const token = localStorage.getItem("GITHUB_TOKEN");
  const response = await fetch("/api/github/commit-diffs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      owner,
      repo,
      startDate,
      endDate,
      githubToken: token,
    }),
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.statusText}`);
  }

  const { commits } = await response.json();
  return commits;
};
