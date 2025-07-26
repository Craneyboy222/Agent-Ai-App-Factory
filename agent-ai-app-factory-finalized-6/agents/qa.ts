import { exec } from 'child_process';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { improveCodebase } from './codeGeneration';

interface TestResult {
  output: string;
  success: boolean;
  code: Record<string, string>;
}

/**
 * Run automated tests on a generated codebase.
 *
 * This function writes the provided files into a temporary directory,
 * installs dependencies (skipped if offline), runs `npm test` and returns
 * the test output.  It deletes the temporary directory when finished.
 *
 * @param code Map of file paths to contents representing the generated app
 */
export async function runTests(
  code: Record<string, string>,
  onProgress?: (msg: string) => void,
  retryLimit = 2
): Promise<TestResult> {
  let attempt = 0;
  let currentCode = code;
  let combinedOutput = '';

  while (attempt <= retryLimit) {
    const { output, success } = await runOnce(currentCode, onProgress);
    combinedOutput += `--- Attempt ${attempt + 1} ---\n` + output + '\n';

    if (success) {
      return { output: combinedOutput, success: true, code: currentCode };
    }

    attempt++;
    if (attempt > retryLimit) break;
    onProgress?.('Tests failed. Sending diagnostics to code generation agent...');
    currentCode = await improveCodebase(currentCode, output);
  }

  return { output: combinedOutput, success: false, code: currentCode };
}

async function runOnce(
  code: Record<string, string>,
  onProgress?: (msg: string) => void
): Promise<{ output: string; success: boolean }> {
  const tempRoot = mkdtempSync(path.join(tmpdir(), 'ai-app-'));
  try {
    for (const [filePath, content] of Object.entries(code)) {
      const dest = path.join(tempRoot, filePath);
      const dir = path.dirname(dest);
      mkdirSync(dir, { recursive: true });
      writeFileSync(dest, content, 'utf8');
    }

    const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const execAsync = (cmd: string) =>
      new Promise<{ out: string; ok: boolean }>((resolve) => {
        exec(cmd, { cwd: tempRoot }, (err, stdout, stderr) => {
          resolve({ out: stdout + stderr, ok: !err });
        });
      });

    onProgress?.('Installing dependencies...');
    const install = await execAsync(`${npm} install --omit=optional`);
    let output = install.out;
    if (!install.ok) {
      return { output, success: false };
    }

    onProgress?.('Running Jest tests...');
    const jest = await execAsync(`${npm} test -- --runInBand`);
    output += jest.out;
    if (!jest.ok) {
      return { output, success: false };
    }

    onProgress?.('Running Playwright tests...');
    const pwInstall = await execAsync(`npx playwright install`);
    output += pwInstall.out;
    const pw = await execAsync(`npx playwright test --reporter line`);
    output += pw.out;

    return { output, success: pw.ok };
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}