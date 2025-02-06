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
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers,
      }
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

export const fetchCommits = async (
  owner: string,
  repo: string,
  startDate: Date,
  endDate: Date
): Promise<Array<{ message: string }>> => {
  const token = localStorage.getItem("GITHUB_TOKEN");
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const since = startDate.toISOString();
  const until = endDate.toISOString();

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/commits?since=${since}&until=${until}`,
    { headers }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  const commits = (await response.json()) as GitHubCommit[];
  return commits.map((commit) => ({
    message: commit.commit.message,
  }));
};

export const fetchCommitDiffs = async (
  owner: string,
  repo: string,
  startDate: Date,
  endDate: Date
): Promise<Array<{ message: string; diff: string }>> => {
  const token = localStorage.getItem("GITHUB_TOKEN");
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const since = startDate.toISOString();
  const until = endDate.toISOString();

  // First get the commits
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/commits?since=${since}&until=${until}`,
    { headers }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  const commits = (await response.json()) as GitHubCommit[];

  // Then fetch the diff for each commit
  const commitsWithDiffs = await Promise.all(
    commits.map(async (commit) => {
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
