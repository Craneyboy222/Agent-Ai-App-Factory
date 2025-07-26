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
 * Aggregate ideas from all market research scrapers and return the top few.
 * Currently fetches from Flippa and Product Hunt.
 */
export async function getMarketIdeas(): Promise<AppIdea[]> {
  // Fetch ideas concurrently
  const [flippaIdeas, phIdeas] = await Promise.all([
    scrapeFlippa(),
    scrapeProductHunt()
  ]);
  const combined = [...flippaIdeas, ...phIdeas];
  // Limit to 5 ideas for the proof of concept
  return combined.slice(0, 5);
}