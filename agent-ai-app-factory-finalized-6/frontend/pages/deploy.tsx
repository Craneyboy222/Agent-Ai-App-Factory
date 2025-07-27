import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

/**
 * Deployment page.  Reads the generated code from localStorage, allows the
 * user to specify a GitHub repository name, then deploys the code via the
 * deployment agent.  Displays the resulting GitHub and Vercel URLs and
 * stores the live URL for the next step.
 */
export default function DeployPage() {
  const [repoName, setRepoName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ repoUrl: string; liveUrl: string; zipBase64: string } | null>(null);

  // Load generated code from localStorage
  function loadCode(): Record<string, string> | null {
    if (typeof window === 'undefined') return null;
    const codeStr = localStorage.getItem('generatedCode');
    if (!codeStr) return null;
    try {
      return JSON.parse(codeStr);
    } catch (e) {
      console.error('Failed to parse code from localStorage');
      return null;
    }
  }

  async function handleDeploy() {
    const code = loadCode();
    if (!code) {
      setError('No generated code found. Please run code generation first.');
      return;
    }
    if (!repoName) {
      setError('Please enter a repository name.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const url = baseUrl ? `${baseUrl}/api/deploy` : '/api/deploy';
      const res = await axios.post(url, { code, repoName });
      setResult(res.data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('liveUrl', res.data.liveUrl);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || err?.message || 'Failed to deploy app');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Deployment</h1>
      <p className="mb-4 text-gray-700">
        Provide a GitHub repository name and deploy your generated code to Vercel.
      </p>
      <div className="mb-4">
        <label className="block text-gray-700 mb-1" htmlFor="repoName">
          Repository Name
        </label>
        <input
          id="repoName"
          type="text"
          value={repoName}
          onChange={(e) => setRepoName(e.target.value)}
          className="w-full border border-gray-300 rounded p-2"
        />
      </div>
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
        onClick={handleDeploy}
        disabled={loading}
      >
        {loading ? 'Deploying…' : 'Deploy App'}
      </button>
      {error && <p className="text-red-600 mt-4">{error}</p>}
      {result && (
        <div className="mt-6 space-y-3">
          <p className="text-gray-700">Deployment complete!</p>
          <p>
            GitHub Repo: {' '}
            <a href={result.repoUrl} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              {result.repoUrl}
            </a>
          </p>
          <p>
            Live URL: {' '}
            <a href={result.liveUrl} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              {result.liveUrl}
            </a>
          </p>
          <p>
            Download ZIP:{' '}
            <a
              href={`data:application/zip;base64,${result.zipBase64}`}
              download="workspace.zip"
              className="text-blue-600 hover:underline"
            >
              workspace.zip
            </a>
          </p>
          <Link
            href="/qa"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded"
          >
            Continue to QA
          </Link>
        </div>
      )}
    </div>
  );
}
