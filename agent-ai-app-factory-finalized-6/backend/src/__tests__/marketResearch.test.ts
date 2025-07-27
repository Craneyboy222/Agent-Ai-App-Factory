jest.mock('../../../agents/marketResearch.ts', () => {
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
        scrapeQuora()
      ]);
      return results.flat().slice(0, 10);
    }
  };
});
const { getMarketIdeas } = require('../../../agents/marketResearch.ts');

describe('getMarketIdeas', () => {
  it('aggregates results from scrapers', async () => {
    const ideas = await getMarketIdeas();
    expect(ideas).toHaveLength(2);
    expect(ideas[0].title).toBe('A');
    expect(ideas[1].title).toBe('B');
  });
});
