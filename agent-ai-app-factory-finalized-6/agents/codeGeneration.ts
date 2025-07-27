import OpenAI from 'openai';
import { Specification } from './specification';

// Set up OpenAI client with API key from environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate a full stack codebase based off of a technical specification.  The
 * returned value is a mapping of file paths to their corresponding source
 * contents.  A Next.js/React client, a Node/Express server and Prisma
 * database layer are included.  All generated code should be runnable
 * immediately after installation of dependencies and configuration of
 * environment variables.
 *
 * @param spec The specification produced by the specification agent.
 */
export async function generateCodebase(spec: Specification): Promise<Record<string, string>> {
  // Compose a prompt describing the desired output.  We instruct the model to
  // return only JSON: keys are file paths relative to the project root and
  // values are full text content.  We emphasise production readiness and
  // enterprise quality (authentication, RBAC, testing, etc.).
  const prompt = `You are a full stack engineer tasked with generating a complete web application codebase.\n\n`
    + `Here is the technical specification for the app:\n${JSON.stringify(spec, null, 2)}\n\n`
    + `Build a Next.js frontend using React and TailwindCSS.  Use TypeScript throughout.\n`
    + `The backend should be a Node.js Express server written in TypeScript, using Prisma ORM to connect to a PostgreSQL database.\n`
    + `Implement user authentication using Supabase Auth with role-based access control.\n`
    + `Create REST API endpoints for all entities defined in the specification.\n`
    + `Implement unit tests with Jest and end‑to‑end tests with Playwright.\n`
    + `Return the entire project as a JSON object where keys are file paths (including src/ prefixes) and values are the file contents.  Do not include code fences or extra commentary.\n`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
  });

  const content = response.choices[0].message?.content || '{}';
  try {
    return JSON.parse(content) as Record<string, string>;
  } catch (error) {
    console.error('Failed to parse generated code JSON:', content);
    throw error;
  }
}

/**
 * Attempt to fix a codebase using failing test diagnostics. The updated files
 * are returned in the same JSON mapping format as {@link generateCodebase}.
 */
export async function improveCodebase(
  code: Record<string, string>,
  diagnostics: string
): Promise<Record<string, string>> {
  const prompt = `You previously generated the following project as JSON where keys are file paths and values are file contents:\n` +
    `${JSON.stringify(code)}\n\n` +
    `Tests produced the following diagnostics:\n${diagnostics}\n\n` +
    `Update the project so all tests pass. Return ONLY the updated project JSON without explanations.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  });

  const content = response.choices[0].message?.content || '{}';
  try {
    return JSON.parse(content) as Record<string, string>;
  } catch (error) {
    console.error('Failed to parse improved code JSON:', content);
    throw error;
  }
}
