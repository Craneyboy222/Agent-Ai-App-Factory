import { generateCodebase } from '../../../agents/codeGeneration';

jest.mock('openai', () => ({
  __esModule: true,
  default: class {
    chat = { completions: { create: jest.fn().mockResolvedValue({ choices: [{ message: { content: '{"index.ts":"console.log(1);"}' } }] }) } };
  }
}));

test('returns parsed project JSON', async () => {
  const code = await generateCodebase({} as any);
  expect(code['index.ts']).toBe('console.log(1);');
});
