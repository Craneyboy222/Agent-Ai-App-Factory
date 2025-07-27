import { runTests } from '../../../agents/qa';

jest.mock('child_process', () => ({
  exec: (_cmd: string, _opts: any, cb: any) => cb(null, 'ok', '')
}));

jest.mock('fs', () => ({
  mkdtempSync: () => '/tmp/test',
  writeFileSync: jest.fn(),
  rmSync: jest.fn(),
  mkdirSync: jest.fn()
}));

jest.mock('os', () => ({ tmpdir: () => '/tmp' }));

jest.mock('../../../agents/codeGeneration', () => ({ improveCodebase: jest.fn(async () => ({})) }));

describe('runTests', () => {
  it('reports success when commands succeed', async () => {
    const result = await runTests({});
    expect(result.success).toBe(true);
  });
});
