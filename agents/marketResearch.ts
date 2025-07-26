import axios from 'axios';
import * as cheerio from 'cheerio';

export interface AppIdea {
  title: string;
  description: string;
  price?: number;
  url?: string;
}

export async function scrapeFlippa(): Promise<AppIdea[]> {
  try {
    const response = await axios.get('https://flippa.com/marketplace/websites');
    const $ = cheerio.load(response.data);
    const ideas: AppIdea[] = [];

    $('.tile-title').each((index, element) => {
      const title = $(element).text().trim();
      const description = $(element).next('.tile-description').text().trim();
      const priceText = $(element).nextAll('.tile-price').first().text().replace(/[\$,]/g, '').trim();
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

export async function scrapeProductHunt(): Promise<AppIdea[]> {
  try {
    const response = await axios.get('https://www.producthunt.com/');
    const $ = cheerio.load(response.data);
    const ideas: AppIdea[] = [];
    $('.styles_products__title___1-1R8').each((index, element) => {
      const title = $(element).text().trim();
      const description = $(element).next('.styles_products__tagline___6s4zS').text().trim();
      const url = 'https://www.producthunt.com' + $(element).closest('a').attr('href');
      ideas.push({ title, description, url });
    });
    return ideas;
  } catch (error) {
    console.error('Error scraping Product Hunt:', error);
    return [];
  }
}

export async function getMarketIdeas(): Promise<AppIdea[]> {
  const [flippaIdeas, phIdeas] = await Promise.all([scrapeFlippa(), scrapeProductHunt()]);
  const combined = [...flippaIdeas, ...phIdeas];
  return combined.slice(0, 5);
}
