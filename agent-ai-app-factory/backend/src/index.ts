import express from 'express';
import cors from 'cors';

// Import agent functions relative to backend/src
// Using relative path via two directories up to the shared `agents` folder
import { getMarketIdeas } from '../../agents/marketResearch';
import { generateSpecification } from '../../agents/specification';
import { generateCodebase } from '../../agents/codeGeneration';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// POST /api/research
// Returns an array of validated app ideas scraped from external sites
app.post('/api/research', async (_req, res) => {
  try {
    const ideas = await getMarketIdeas();
    res.json({ ideas });
  } catch (error: any) {
    console.error('Research agent error:', error);
    res.status(500).json({ message: error.message || 'Failed to generate market research.' });
  }
});

// POST /api/specification
// Expects { idea: string } in body.  Returns a detailed specification for the given idea.
app.post('/api/specification', async (req, res) => {
  const { idea } = req.body;
  if (!idea) {
    return res.status(400).json({ message: 'Missing idea string.' });
  }
  try {
    const spec = await generateSpecification(idea);
    res.json(spec);
  } catch (error: any) {
    console.error('Specification agent error:', error);
    res.status(500).json({ message: error.message || 'Failed to generate specification.' });
  }
});

// POST /api/generate-code
// Expects { spec: Specification } in body.  Returns a mapping of file paths to source code.
app.post('/api/generate-code', async (req, res) => {
  const { spec } = req.body;
  if (!spec) {
    return res.status(400).json({ message: 'Missing specification.' });
  }
  try {
    const code = await generateCodebase(spec);
    res.json(code);
  } catch (error: any) {
    console.error('Code generation agent error:', error);
    res.status(500).json({ message: error.message || 'Failed to generate codebase.' });
  }
});

// Start server
const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});