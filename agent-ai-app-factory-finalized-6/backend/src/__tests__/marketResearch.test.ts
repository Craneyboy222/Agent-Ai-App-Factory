import * as market from '../../../agents/marketResearch';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('getMarketIdeas', () => {
  it('aggregates results from scrapers', async () => {
    let getMarketIdeas: any;
    jest.isolateModules(() => {
      jest.doMock('../../../agents/marketResearch.ts', () => {
        const scrapeFlippa = jest.fn(async () => [{ title: 'A', description: 'a' }]);
        const scrapeProductHunt = jest.fn(async () => [{ title: 'B', description: 'b' }]);
        const scrapeCodeCanyon = jest.fn(async () => []);
        const scrapeGoogleTrends = jest.fn(async () => []);
        const scrapeReddit = jest.fn(async () => []);
        const scrapeQuora = jest.fn(async () => []);
        return {
          __esModule: true,
          scrapeFlippa,
          scrapeProductHunt,
          scrapeCodeCanyon,
          scrapeGoogleTrends,
          scrapeReddit,
          scrapeQuora,
          getMarketIdeas: async () => {
            const results = await Promise.all([
              scrapeFlippa(),
              scrapeProductHunt(),
              scrapeCodeCanyon(),
              scrapeGoogleTrends(),
              scrapeReddit(),
              scrapeQuora(),
            ]);
            return results.flat().slice(0, 10);
          },
        };
      });
      ({ getMarketIdeas } = require('../../../agents/marketResearch.ts'));
    });
    const ideas = await getMarketIdeas();
    expect(ideas).toHaveLength(2);
    expect(ideas[0].title).toBe('A');
    expect(ideas[1].title).toBe('B');
  });
});

describe('scrapeGoogleTrends', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.ZENSERP_API_KEY;
  });

  it('returns empty array if key missing', async () => {
    const ideas = await market.scrapeGoogleTrends();
    expect(ideas).toEqual([]);
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('fetches trends from zenserp', async () => {
    process.env.ZENSERP_API_KEY = 'k';
    mockedAxios.get.mockResolvedValue({ data: { trendingSearches: [
      { title: 'T', snippet: 'd', shareUrl: 'u', formattedTraffic: '5K' }
    ] } });
    const ideas = await market.scrapeGoogleTrends();
    expect(mockedAxios.get).toHaveBeenCalledWith('https://app.zenserp.com/api/v2/trends', {
      params: { apikey: 'k', gl: 'US' }
    });
    expect(ideas[0].title).toBe('T');
  });

  it('handles errors gracefully', async () => {
    process.env.ZENSERP_API_KEY = 'k';
    mockedAxios.get.mockRejectedValue(new Error('fail'));
    const ideas = await market.scrapeGoogleTrends();
    expect(ideas).toEqual([]);
  });
});
