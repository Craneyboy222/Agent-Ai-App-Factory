import { Octokit } from '@octokit/rest';
import { VercelClient } from '@vercel/client';
import * as fs from 'fs/promises';
import * as path from 'path';
import os from 'os';

export interface DeployResult {
  repoUrl: string;
  liveUrl: string;
}

/**
 * Deploy a full-stack app to GitHub and Vercel.
 * @param code - mapping of file paths to contents
 * @param repoName - desired GitHub repository name
 */
export async function deployApp(code: Record<string, string>, repoName: string): Promise<DeployResult> {
  const githubToken = process.env.GITHUB_TOKEN;
  const vercelToken = process.env.VERCEL_TOKEN;
  if (!githubToken) throw new Error('Missing GITHUB_TOKEN');
  if (!vercelToken) throw new Error('Missing VERCEL_TOKEN');

  const octokit = new Octokit({ auth: githubToken });
  const vercel = new VercelClient({ token: vercelToken, teamId: process.env.VERCEL_TEAM });

  // Create GitHub repo
  const { data: repo } = await octokit.repos.createForAuthenticatedUser({
    name: repoName,
    private: false,
  });

  // Write files to a temp directory
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'deploy-'));
  await Promise.all(
    Object.keys(code).map(async (filePath) => {
      const fullPath = path.join(tmpDir, filePath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, code[filePath]);
    })
  );

  // Commit each file to the new repo
  for (const filePath of Object.keys(code)) {
    const content = Buffer.from(code[filePath]).toString('base64');
    await octokit.repos.createOrUpdateFileContents({
      owner: repo.owner!.login,
      repo: repo.name,
      path: filePath,
      message: `Add ${filePath}`,
      content,
    });
  }

  // Deploy to Vercel
  const deployment = await vercel.deploy(tmpDir, { name: repoName });
  const liveUrl = `https://${deployment.url}`;

  return {
    repoUrl: repo.html_url!,
    liveUrl,
  };
}
