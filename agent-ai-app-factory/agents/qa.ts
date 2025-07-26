import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import os from 'os';

export interface TestResult {
  success: boolean;
  output: string;
}

/**
 * Run automated tests on a generated codebase. Writes the provided code files to a
 * temporary directory, installs dependencies, executes the test suite and
 * returns whether the tests passed along with any output.
 */
export async function runTests(code: Record<string, string>): Promise<TestResult> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-'));
  // Write code files to the temp directory
  Object.keys(code).forEach((filePath) => {
    const fullPath = path.join(tmpDir, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, code[filePath]);
  });
  let success = true;
  let output = '';
  try {
    // Install dependencies and run tests
    execSync('npm install', { cwd: tmpDir, stdio: 'ignore' });
    execSync('npm test', { cwd: tmpDir, stdio: 'pipe' });
    output = 'All tests passed';
  } catch (err) {
    success = false;
    output = (err as Error).message;
  }
  // Clean up temporary directory
  fs.rmSync(tmpDir, { recursive: true, force: true });
  return { success, output };
}
