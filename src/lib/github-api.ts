import axios from 'axios';

const GITHUB_API_BASE = 'https://api.github.com';

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  html_url: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  user: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  assignee: {
    login: string;
    avatar_url: string;
    html_url: string;
  } | null;
  assignees: Array<{
    login: string;
    avatar_url: string;
    html_url: string;
  }>;
  labels: Array<{
    name: string;
    color: string;
  }>;
  body: string | null;
  pull_request?: {
    url: string;
    html_url: string;
    merged_at: string | null;
  };
  comments: number;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  description: string;
  html_url: string;
  stargazers_count: number;
  open_issues_count: number;
  forks_count: number;
}

export interface GitHubContributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

export interface IssueTimeline {
  event: string;
  created_at: string;
  actor?: {
    login: string;
    avatar_url: string;
  };
  assignee?: {
    login: string;
    avatar_url: string;
  };
  label?: {
    name: string;
    color: string;
  };
}

class GitHubAPI {
  private getHeaders() {
    return {
      'Accept': 'application/vnd.github.v3+json',
    };
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    const response = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async getIssues(
    owner: string,
    repo: string,
    options: {
      state?: 'open' | 'closed' | 'all';
      sort?: 'created' | 'updated' | 'comments';
      direction?: 'asc' | 'desc';
      per_page?: number;
      page?: number;
      labels?: string;
      assignee?: string;
    } = {}
  ): Promise<GitHubIssue[]> {
    const params = new URLSearchParams({
      state: options.state || 'all',
      sort: options.sort || 'updated',
      direction: options.direction || 'desc',
      per_page: String(options.per_page || 30),
      page: String(options.page || 1),
      ...(options.labels && { labels: options.labels }),
      ...(options.assignee && { assignee: options.assignee }),
    });

    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues?${params}`,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async getIssue(owner: string, repo: string, issueNumber: number): Promise<GitHubIssue> {
    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}`,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async getIssueTimeline(owner: string, repo: string, issueNumber: number): Promise<IssueTimeline[]> {
    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}/timeline`,
      {
        headers: {
          ...this.getHeaders(),
          'Accept': 'application/vnd.github.mockingbird-preview+json',
        },
      }
    );
    return response.data;
  }

  async getContributors(owner: string, repo: string): Promise<GitHubContributor[]> {
    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/contributors?per_page=100`,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async getPullRequests(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'all') {
    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls?state=${state}&per_page=100`,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  // Helper to check if an issue is stale (assigned but no recent activity)
  isStaleIssue(issue: GitHubIssue, daysThreshold = 7): boolean {
    if (!issue.assignee && issue.assignees.length === 0) return false;
    if (issue.state === 'closed') return false;
    if (issue.pull_request) return false;

    const lastUpdate = new Date(issue.updated_at);
    const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    
    return daysSinceUpdate > daysThreshold;
  }

  // Parse owner/repo from various formats
  parseRepoUrl(input: string): { owner: string; repo: string } | null {
    // Handle full GitHub URLs
    const urlMatch = input.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (urlMatch) {
      return { owner: urlMatch[1], repo: urlMatch[2].replace(/\.git$/, '') };
    }

    // Handle owner/repo format
    const directMatch = input.match(/^([^\/]+)\/([^\/]+)$/);
    if (directMatch) {
      return { owner: directMatch[1], repo: directMatch[2] };
    }

    return null;
  }
}

export const githubAPI = new GitHubAPI();
