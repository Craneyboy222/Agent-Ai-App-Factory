import { exec } from 'child_process';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';

/**
 * Run automated tests on a generated codebase.
 *
 * This function writes the provided files into a temporary directory,
 * installs dependencies (skipped if offline), runs `npm test` and returns
 * the test output.  It deletes the temporary directory when finished.
 *
 * @param code Map of file paths to contents representing the generated app
 */
export async function runTests(code: Record<string, string>): Promise<string> {
  const tempRoot = mkdtempSync(path.join(tmpdir(), 'ai-app-'));
  // Write files to disk
  for (const [filePath, content] of Object.entries(code)) {
    const dest = path.join(tempRoot, filePath);
    // ensure directory exists
    const dir = path.dirname(dest);
    mkdirSync(dir, { recursive: true });
    writeFileSync(dest, content, 'utf8');
  }
  // Install dependencies and run tests
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const execAsync = (cmd: string, cwd: string) => new Promise<string>((resolve, reject) => {
    exec(cmd, { cwd }, (err, stdout, stderr) => {
      if (err) reject(new Error(stderr || stdout));
      else resolve(stdout + stderr);
    });
  });
  let output = '';
  try {
    output += await execAsync(`${npm} install --omit=optional`, tempRoot);
    output += await execAsync(`${npm} test -- --runInBand`, tempRoot);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
  return output;
}