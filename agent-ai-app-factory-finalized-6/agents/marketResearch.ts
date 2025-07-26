import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Represents a potential app opportunity discovered via market research.
 */
export interface AppIdea {
  title: string;
  description: string;
  /**
   * Price or revenue associated with the idea, if available.
   */
  price?: number;
  /**
   * Link to the listing or source of the idea.
   */
  url?: string;
  /**
   * Optional metrics for ranking the opportunity. Keys differ per source
   * e.g. { stars: 4.8 } or { trendScore: 50000 }
   */
  metrics?: Record<string, number>;
}

/**
 * Scrape app listings from Flippa.  Each listing contains a title, description,
 * price and URL back to Flippa.  Returns up to ~50 listings from the first page.
 */
export async function scrapeFlippa(): Promise<AppIdea[]> {
  try {
    const response = await axios.get('https://flippa.com/marketplace/websites');
    const $ = cheerio.load(response.data);
    const ideas: AppIdea[] = [];
    $('.tile-title').each((_, element) => {
      const title = $(element).text().trim();
      const description = $(element)
        .next('.tile-description')
        .text()
        .trim();
      const priceText = $(element)
        .nextAll('.tile-price')
        .first()
        .text()
        .replace(/[\$,]/g, '')
        .trim();
      const price = priceText ? parseFloat(priceText) : undefined;
      const url = $(element).closest('a').attr('href') || '';
      ideas.push({ title, description, price, url });
    });
    return ideas;
  } catch (error) {
    console.error('Error scraping Flippa:', error);
    return [];
  }
}

/**
 * Scrape trending products from the front page of Product Hunt.  Returns a list
 * of product titles and taglines with links back to the listing on producthunt.com.
 */
export async function scrapeProductHunt(): Promise<AppIdea[]> {
  try {
    const response = await axios.get('https://www.producthunt.com/');
    const $ = cheerio.load(response.data);
    const ideas: AppIdea[] = [];
    $('.styles_products__title___1-1R8').each((_, element) => {
      const title = $(element).text().trim();
      const description = $(element)
        .next('.styles_products__tagline___6s4zS')
        .text()
        .trim();
      const url =
        'https://www.producthunt.com' + $(element).closest('a').attr('href');
      ideas.push({ title, description, url });
    });
    return ideas;
  } catch (error) {
    console.error('Error scraping Product Hunt:', error);
    return [];
  }
}

/**
 * Fetch popular scripts from CodeCanyon via the Envato Market API. Requires
 * ENVATO_TOKEN to be set. Returns title, description and rating metrics.
 */
export async function scrapeCodeCanyon(): Promise<AppIdea[]> {
  const token = process.env.ENVATO_TOKEN;
  if (!token) {
    console.warn('Missing ENVATO_TOKEN, skipping CodeCanyon scrape');
    return [];
  }
  try {
    const resp = await axios.get(
      'https://api.envato.com/v1/market/popular:codecanyon.json',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const items =
      resp.data?.popular?.items_last_week || resp.data?.popular?.items || [];
    return items.slice(0, 10).map((item: any) => ({
      title: item.item || item.name,
      description: item.summary || '',
      price: item.price_cents ? item.price_cents / 100 : undefined,
      url: item.url,
      metrics: item.rating ? { stars: parseFloat(item.rating) } : undefined
    }));
  } catch (error) {
    console.error('Error scraping CodeCanyon:', error);
    return [];
  }
}

/**
 * Retrieve trending search topics from Google Trends using the
 * `google-trends-api` package.
 */
export async function scrapeGoogleTrends(): Promise<AppIdea[]> {
  try {
    const googleTrends = await import('google-trends-api');
    const result = await googleTrends.dailyTrends({ geo: 'US' });
    const data = JSON.parse(result as unknown as string);
    const days = data.default.trendingSearchesDays || [];
    const searches = days[0]?.trendingSearches || [];
    return searches.slice(0, 10).map((s: any) => ({
      title: s.title.query,
      description: s.snippet || '',
      url: s.shareUrl,
      metrics: s.formattedTraffic
        ? { trendScore: parseInt(s.formattedTraffic.replace(/\D/g, '')) }
        : undefined
    }));
  } catch (error) {
    console.error('Error scraping Google Trends:', error);
    return [];
  }
}

/**
 * Scrape top monthly posts from r/startups on Reddit. Uses the JSON listing
 * endpoint and reports upvote counts.
 */
export async function scrapeReddit(): Promise<AppIdea[]> {
  try {
    const ua = process.env.REDDIT_USER_AGENT || 'agent-ai-app-factory';
    const resp = await axios.get(
      'https://www.reddit.com/r/startups/top.json?limit=10&t=month',
      { headers: { 'User-Agent': ua } }
    );
    const posts = resp.data?.data?.children || [];
    return posts.map((p: any) => ({
      title: p.data.title,
      description: p.data.selftext?.slice(0, 140) || '',
      url: 'https://www.reddit.com' + p.data.permalink,
      metrics: { upvotes: p.data.ups }
    }));
  } catch (error) {
    console.error('Error scraping Reddit:', error);
    return [];
  }
}

/**
 * Scrape popular questions from Quora by reading the public RSS feed of the
 * Entrepreneurship topic. Metrics include the number of answers if available.
 */
export async function scrapeQuora(): Promise<AppIdea[]> {
  try {
    const resp = await axios.get(
      'https://www.quora.com/topic/Entrepreneurship/rss'
    );
    const $ = cheerio.load(resp.data, { xmlMode: true });
    const ideas: AppIdea[] = [];
    $('item').each((_, el) => {
      const title = $(el).find('title').text();
      const description = $(el).find('description').text();
      const url = $(el).find('link').text();
      ideas.push({ title, description, url });
    });
    return ideas.slice(0, 10);
  } catch (error) {
    console.error('Error scraping Quora:', error);
    return [];
  }
}

/**
 * Aggregate ideas from all market research scrapers and return the top few.
 * Currently fetches from Flippa and Product Hunt.
 */
export async function getMarketIdeas(): Promise<AppIdea[]> {
  const results = await Promise.all([
    scrapeFlippa(),
    scrapeProductHunt(),
    scrapeCodeCanyon(),
    scrapeGoogleTrends(),
    scrapeReddit(),
    scrapeQuora()
  ]);
  const combined = results.flat();
  // Return a small sample to avoid flooding the UI
  return combined.slice(0, 10);
}