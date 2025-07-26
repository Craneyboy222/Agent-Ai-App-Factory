import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const {
  ENVATO_TOKEN,
  REDDIT_USER_AGENT
} = process.env;

if (!ENVATO_TOKEN) {
  console.warn('ENVATO_TOKEN not set - CodeCanyon results will be skipped');
}

// Import agent functions relative to backend/src
// Using relative path via two directories up to the shared `agents` folder
import { getMarketIdeas } from '../../agents/marketResearch';
import { generateSpecification } from '../../agents/specification';
import { generateCodebase } from '../../agents/codeGeneration';
import { deployApp } from '../../agents/deployment';
import { runTests } from '../../agents/qa';
import { generateListing } from '../../agents/marketplace';
import { getAnalytics } from '../../agents/feedback';

const app = express();

interface QaJob {
  output: string[];
  done: boolean;
}

const qaJobs = new Map<string, QaJob>();

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

// POST /api/deploy
// Expects { code: Record<string,string>, repoName: string }
// Creates a GitHub repository, commits the code, deploys to Vercel
app.post('/api/deploy', async (req, res) => {
  const { code, repoName } = req.body;
  if (!code || !repoName) {
    return res.status(400).json({ message: 'Missing code or repoName.' });
  }
  try {
    const result = await deployApp(code, repoName);
    res.json(result);
  } catch (error: any) {
    console.error('Deployment agent error:', error);
    res.status(500).json({ message: error.message || 'Failed to deploy app.' });
  }
});

// POST /api/qa
// Expects { code: Record<string,string> }
// Runs unit and end‑to‑end tests on the provided codebase
app.post('/api/qa', async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ message: 'Missing code.' });
  }

  const jobId = Date.now().toString();
  qaJobs.set(jobId, { output: [], done: false });

  runTests(code, msg => {
    const job = qaJobs.get(jobId);
    if (job) job.output.push(msg);
  })
    .then(result => {
      const job = qaJobs.get(jobId);
      if (job) {
        job.output.push(result.output);
        job.done = true;
      }
    })
    .catch(err => {
      const job = qaJobs.get(jobId);
      if (job) {
        job.output.push(err.message || 'Tests failed.');
        job.done = true;
      }
    });

  res.json({ jobId });
});

app.get('/api/qa/:id', (req, res) => {
  const job = qaJobs.get(req.params.id);
  if (!job) {
    return res.status(404).json({ message: 'Job not found.' });
  }
  res.json({ output: job.output.join('\n'), done: job.done });
  if (job.done) {
    qaJobs.delete(req.params.id);
  }
});

// POST /api/listing
// Expects { spec: any, liveUrl: string }
// Generates a marketplace listing for the app
app.post('/api/listing', async (req, res) => {
  const { spec, liveUrl } = req.body;
  if (!spec || !liveUrl) {
    return res.status(400).json({ message: 'Missing spec or liveUrl.' });
  }
  try {
    const listing = await generateListing(spec, liveUrl);
    res.json(listing);
  } catch (error: any) {
    console.error('Marketplace agent error:', error);
    res.status(500).json({ message: error.message || 'Failed to generate listing.' });
  }
});

// GET /api/analytics/:appId
// Retrieves analytics and usage metrics for a deployed app
app.get('/api/analytics/:appId', async (req, res) => {
  const { appId } = req.params;
  try {
    const metrics = await getAnalytics(appId);
    res.json(metrics);
  } catch (error: any) {
    console.error('Feedback agent error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch analytics.' });
  }
});

// Start server
const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});