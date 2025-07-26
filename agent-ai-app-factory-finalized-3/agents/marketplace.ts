import { Configuration, OpenAIApi } from 'openai';

interface Listing {
  title: string;
  tagline: string;
  description: string;
  features: string[];
  pricing: string;
  screenshots: string[];
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

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