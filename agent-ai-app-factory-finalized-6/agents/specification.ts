// Use the default OpenAI client in v4+
import OpenAI from 'openai';

export interface Specification {
  features: string[];
  databaseSchema: string;
  apiSpec: string;
  wireframes: string;
  monetization: string;
  techStack: string;
}

// Initialise an OpenAI client using the API key from the environment.
// If the key is missing, warn but allow the module to load so tests can run.
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.warn('OPENAI_API_KEY not set - specification generation will fail');
}
const openai = new OpenAI({
  apiKey: apiKey || '',
});

/**
 * Generate a comprehensive technical specification for a given app idea.  The
 * returned object includes the feature set, database schema, API design,
 * wireframes, monetization model and recommended tech stack.  The result
 * leverages GPT‑4 and is returned in a structured JSON format.
 *
 * @param idea A short description of the business problem or product idea.
 */
export async function generateSpecification(idea: string): Promise<Specification> {
  // Build a prompt instructing the LLM to return a JSON specification.  We
  // explicitly instruct the model to enclose its response in JSON so that
  // parsing is straightforward.
  const prompt = `You are a senior product architect. Generate a technical specification for the following web application idea.\n\n`
    + `Idea: ${idea}\n\n`
    + `Your response must be valid JSON matching this TypeScript interface:\n`
    + `{\n  "features": string[],\n  "databaseSchema": string,\n  "apiSpec": string,\n  "wireframes": string,\n  "monetization": string,\n  "techStack": string\n}`
    + `\n\nDo not include any prose outside of the JSON; return only the JSON object.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.4,
  });

  const message = response.choices[0].message?.content || '{}';
  try {
    return JSON.parse(message) as Specification;
  } catch (error) {
    console.error('Failed to parse specification JSON:', message);
    throw error;
  }
}
