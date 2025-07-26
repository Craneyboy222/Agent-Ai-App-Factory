import { Configuration, OpenAIApi } from 'openai';
import axios from 'axios';

interface Listing {
  title: string;
  tagline: string;
  description: string;
  features: string[];
  pricing: string;
  screenshots: string[];
  flippaUrl?: string;
  internalUrl?: string;
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

/**
 * Create a listing on Flippa using their public API. Returns the URL of the
 * new listing. Environment variables required:
 *   - FLIPPA_API_KEY
 *   - FLIPPA_API_URL (optional, defaults to the v3 endpoint)
 */
export async function createFlippaListing(listing: Listing): Promise<string> {
  const apiKey = process.env.FLIPPA_API_KEY;
  const baseUrl = process.env.FLIPPA_API_URL || 'https://api.flippa.com/v3/listings';
  if (!apiKey) {
    throw new Error('Missing FLIPPA_API_KEY');
  }
  try {
    const res = await axios.post(baseUrl, listing, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return res.data?.url || '';
  } catch (err) {
    console.error('Failed to create Flippa listing:', err);
    throw err;
  }
}

/**
 * Publish the listing to the internal marketplace API. The endpoint URL should
 * be provided via the INTERNAL_MARKETPLACE_URL environment variable and must
 * return the created listing with a `url` field.
 */
export async function createInternalListing(listing: Listing): Promise<string> {
  const url = process.env.INTERNAL_MARKETPLACE_URL;
  if (!url) {
    throw new Error('Missing INTERNAL_MARKETPLACE_URL');
  }
  try {
    const res = await axios.post(`${url.replace(/\/$/, '')}/listings`, listing);
    return res.data?.url || '';
  } catch (err) {
    console.error('Failed to create internal listing:', err);
    throw err;
  }
}

/**
 * Generate a sales page listing for the given application.  Uses the
 * specification and app metadata to craft SEO‑optimised copy and marketing
 * content suitable for publishing on platforms like Flippa or AppSumo.
 *
 * @param spec The technical specification of the app
 * @param liveUrl A URL to the live demo of the app
 */
export async function generateListing(
  spec: any,
  liveUrl: string
): Promise<Listing> {
  const prompt = `You are a product marketing specialist.  Write a compelling sales page for the following app.\n\n`
    + `Specification:\n${JSON.stringify(spec, null, 2)}\n\n`
    + `Live demo: ${liveUrl}\n\n`
    + `Return your answer as valid JSON with the following structure:\n`
    + `{\n  "title": string,\n  "tagline": string,\n  "description": string,\n  "features": string[],\n  "pricing": string,\n  "screenshots": string[]\n}`;
  const response = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  });
  const content = response.data.choices[0].message?.content || '{}';
  return JSON.parse(content) as Listing;
}