import { Configuration, OpenAIApi } from 'openai';

export interface Specification {
  features: string[];
  databaseSchema: string;
  apiSpec: string;
  wireframes: string;
  monetization: string;
  techStack: string;
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function generateSpecification(idea: string): Promise<Specification> {
  const prompt = `You are a senior product architect. Generate a technical specification for the following web application idea.\n\n`
    + `Idea: ${idea}\n\n`
    + `Your response must be valid JSON matching this TypeScript interface:\n`
    + `{\n  \"features\": string[],\n  \"databaseSchema\": string,\n  \"apiSpec\": string,\n  \"wireframes\": string,\n  \"monetization\": string,\n  \"techStack\": string\n}`
    + `\n\nDo not include any prose outside of the JSON; return only the JSON object.`;

  const response = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.4,
  });

  const message = response.data.choices[0].message?.content || '{}';
  try {
    return JSON.parse(message) as Specification;
  } catch (error) {
    console.error('Failed to parse specification JSON:', message);
    throw error;
  }
}
