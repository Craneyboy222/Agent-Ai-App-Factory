import { getAnalytics } from '../../../agents/feedback';

describe('getAnalytics', () => {
  it('throws when env vars missing', async () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    await expect(getAnalytics('123')).rejects.toThrow('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  });
});
