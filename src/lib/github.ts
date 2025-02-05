import { Octokit } from "@octokit/rest";

const octokit = new Octokit();

export interface Commit {
  sha: string;
  message: string;
  date: string;
  author: string;
}

export const parseGithubUrl = (url: string): { owner: string; repo: string } | null => {
  try {
    const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
    const match = url.match(regex);
    if (!match) return null;
    return { owner: match[1], repo: match[2].replace('.git', '') };
  } catch {
    return null;
  }
};

export const fetchCommits = async (
  owner: string,
  repo: string,
  since: Date,
  until: Date
): Promise<Commit[]> => {
  const commits = await octokit.repos.listCommits({
    owner,
    repo,
    since: since.toISOString(),
    until: until.toISOString(),
  });

  return commits.data.map((commit) => ({
    sha: commit.sha,
    message: commit.commit.message,
    date: commit.commit.author?.date || '',
    author: commit.commit.author?.name || 'Unknown',
  }));
};