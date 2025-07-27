import { scrapeFlippa } from '../../../agents/marketResearch';
import axios from 'axios';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('scrapeFlippa', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.APIFY_API_TOKEN;
  });

  it('throws when token missing', async () => {
    await expect(scrapeFlippa()).rejects.toThrow('Missing APIFY_API_TOKEN');
  });

  it('fetches listings from Apify', async () => {
    process.env.APIFY_API_TOKEN = 't';
    mockedAxios.get.mockResolvedValue({ data: [
      { title: 'A', description: 'd', price: 1, url: 'u' }
    ] });
    const ideas = await scrapeFlippa();
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('actor-tasks/apify~flippa/run-sync-get-dataset-items?token=t')
    );
    expect(ideas[0].title).toBe('A');
  });
});
