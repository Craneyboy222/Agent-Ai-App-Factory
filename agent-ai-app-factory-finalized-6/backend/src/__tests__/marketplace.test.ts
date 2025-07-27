jest.mock('openai', () => ({
  __esModule: true,
  default: class {
    chat = { completions: { create: jest.fn().mockResolvedValue({ choices: [{ message: { content: '{"title":"t","tagline":"tag","description":"d","features":[],"pricing":"p","screenshots":[]}' } }] }) } };
  }
}));

jest.mock('axios');
const axios = require('axios');

import { createFlippaListing, createInternalListing, generateListing } from '../../../agents/marketplace';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('marketplace agents', () => {
  it('createFlippaListing throws when missing token', async () => {
    delete process.env.FLIPPA_API_KEY;
    await expect(createFlippaListing({} as any)).rejects.toThrow('Missing FLIPPA_API_KEY');
  });

  it('createInternalListing throws when missing url', async () => {
    delete process.env.INTERNAL_MARKETPLACE_URL;
    await expect(createInternalListing({} as any)).rejects.toThrow('Missing INTERNAL_MARKETPLACE_URL');
  });

  it('generateListing parses response', async () => {
    const listing = await generateListing({}, 'url');
    expect(listing.title).toBe('t');
  });
});
