import { generateSpecification } from '../../../agents/specification';

jest.mock('openai', () => ({
  __esModule: true,
  default: class {
    chat = { completions: { create: jest.fn().mockResolvedValue({ choices: [{ message: { content: '{"features":[],"databaseSchema":"db","apiSpec":"api","wireframes":"wf","monetization":"mon","techStack":"ts"}' } }] }) } };
  }
}));

test('parses JSON from OpenAI', async () => {
  const spec = await generateSpecification('demo');
  expect(spec.databaseSchema).toBe('db');
});
