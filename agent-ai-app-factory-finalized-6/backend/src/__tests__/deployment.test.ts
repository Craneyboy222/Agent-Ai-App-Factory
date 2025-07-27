import { deployApp } from '../../../agents/deployment';

describe('deployApp', () => {
  it('throws if env vars missing', async () => {
    delete process.env.GITHUB_TOKEN;
    delete process.env.VERCEL_TOKEN;
    await expect(deployApp({}, 'demo')).rejects.toThrow('Missing GITHUB_TOKEN or VERCEL_TOKEN');
  });
});
