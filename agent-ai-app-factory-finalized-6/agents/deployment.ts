import { Octokit } from '@octokit/rest';
import { createDeployment } from '@vercel/client';
import fs from 'fs/promises';
import path from 'path';
import archiver from 'archiver';

/**
 * Deploy the generated app to a new GitHub repository and Vercel.
 *
 * This function creates a GitHub repository under the authenticated user or
 * organisation, commits the provided code files, and then instructs Vercel
 * to deploy the repository.  It returns the GitHub repository URL and the
 * live Vercel deployment URL.
 *
 * Environment variables required:
 *   - GITHUB_TOKEN: personal access token with repo scope
 *   - VERCEL_TOKEN: token for the Vercel API
 *   - VERCEL_TEAM (optional): team slug on Vercel
 *
 * @param code A mapping of file paths to file contents for the generated app
 * @param repoName The desired repository name (without owner)
 */
export async function deployApp(
  code: Record<string, string>,
  repoName: string
): Promise<{ repoUrl: string; liveUrl: string; zipBase64: string }> {
  const githubToken = process.env.GITHUB_TOKEN;
  const vercelToken = process.env.VERCEL_TOKEN;
  if (!githubToken || !vercelToken) {
    throw new Error('Missing GITHUB_TOKEN or VERCEL_TOKEN environment variables');
  }

  // 1. Create GitHub repository and push files
  const octokit = new Octokit({ auth: githubToken });
  // Determine owner from the token's user; you could also hardcode an org
  const user = await octokit.users.getAuthenticated();
  const owner = user.data.login;
  const repo = await octokit.repos.createForAuthenticatedUser({
    name: repoName,
    private: true,
    auto_init: true,
  });
  const repoUrl = repo.data.html_url;

  // Prepare blobs and tree for each file
  const blobs = await Promise.all(
    Object.entries(code).map(async ([filePath, content]) => {
      const blob = await octokit.git.createBlob({
        owner,
        repo: repoName,
        content: content,
        encoding: 'utf-8',
      });
      return { filePath, sha: blob.data.sha };
    })
  );
  // Get the base tree from the default branch
  const base = await octokit.git.getRef({ owner, repo: repoName, ref: 'heads/main' });
  const baseCommit = await octokit.git.getCommit({ owner, repo: repoName, commit_sha: base.data.object.sha });
  // Create a new tree with all files
  const tree = await octokit.git.createTree({
    owner,
    repo: repoName,
    base_tree: baseCommit.data.tree.sha,
    tree: blobs.map(({ filePath, sha }) => ({ path: filePath, mode: '100644', type: 'blob', sha })),
  });
  // Create a commit with the new tree
  const commit = await octokit.git.createCommit({
    owner,
    repo: repoName,
    message: 'Initial commit from Agent AI App Factory',
    tree: tree.data.sha,
    parents: [baseCommit.data.sha],
  });
  // Update the branch reference to the new commit
  await octokit.git.updateRef({ owner, repo: repoName, ref: 'heads/main', sha: commit.data.sha });

  // 2. Trigger Vercel deployment using `createDeployment`
  let liveUrl = '';
  const tempDir = await fs.mkdtemp(path.join(process.cwd(), 'vercel-deploy-'));
  try {
    await Promise.all(
      Object.entries(code).map(([filePath, content]) => {
        const fullPath = path.join(tempDir, filePath);
        return fs
          .mkdir(path.dirname(fullPath), { recursive: true })
          .then(() => fs.writeFile(fullPath, content));
      })
    );

    const teamId = process.env.VERCEL_TEAM;
    let deploymentUrl = '';
    for await (const event of createDeployment({
      token: vercelToken,
      path: tempDir,
      teamId: teamId || undefined,
      projectName: repoName,
      force: true,
    })) {
      if (event.type === 'ready') {
        deploymentUrl = event.payload.url;
      } else if (event.type === 'error') {
        throw event.payload;
      }
    }
    liveUrl = deploymentUrl;
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
  // 3. Package the workspace into a ZIP archive
  const archive = archiver('zip', { zlib: { level: 9 } });
  const buffers: Buffer[] = [];
  archive.on('data', (d: Buffer) => buffers.push(d));
  const finalize = new Promise<void>((resolve, reject) => {
    archive.on('end', () => resolve());
    archive.on('error', (err: Error) => reject(err));
  });
  for (const [filePath, content] of Object.entries(code)) {
    archive.append(content, { name: filePath });
  }
  archive.finalize();
  await finalize;
  const zipBase64 = Buffer.concat(buffers).toString('base64');

  return { repoUrl, liveUrl, zipBase64 };
}