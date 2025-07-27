import request from 'supertest';

process.env.OPENAI_API_KEY = 'test';
// Load modules after setting the env var so OpenAI initialisation doesn't fail
const spec = require('../../../agents/specification');
const { app } = require('../index');

describe('POST /api/specification', () => {
  it('returns a generated spec', async () => {
    jest.spyOn(spec, 'generateSpecification').mockResolvedValue({ title: 'Demo' } as any);
    const res = await request(app).post('/api/specification').send({ idea: 'demo' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ title: 'Demo' });
  });
});
