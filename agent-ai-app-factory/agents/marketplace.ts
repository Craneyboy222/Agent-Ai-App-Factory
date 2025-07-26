import { Configuration, OpenAIApi } from 'openai';

export interface Listing {
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
 * Generate a professional sales listing for an app including title, tagline,
 * description, features, pricing, and screenshot captions. Uses OpenAI to
 * craft marketing copy. Currently returns the raw description without
 * parsing into structured sections.
 */
export async function generateListing(appName: string, appDescription: string): Promise<Listing> {
  const prompt = `You are a marketing expert writing a sales listing for an enterprise-grade SaaS product. Provide a catchy title, a short tagline, a detailed description, three key features as bullet points, a recommended pricing model, and three suggested screenshot captions. Be concise and professional.\n\nApp Name: ${appName}\nDescription: ${appDescription}\n\nListing:`;
  const completion = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  });
  const content = completion.data.choices[0].message?.content || '';
  return {
    title: `${appName} Listing`,
    tagline: '',
    description: content,
    features: [],
    pricing: '',
    screenshots: [],
  };
}
