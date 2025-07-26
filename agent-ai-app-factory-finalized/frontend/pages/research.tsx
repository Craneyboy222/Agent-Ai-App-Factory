import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface Idea {
  title: string;
  description: string;
  price?: number;
  url?: string;
}

/**
 * The Research page allows the user to kick off the Market Research agent.
 * It fetches up to five validated app ideas from real data sources and
 * displays them.  Users can continue to the specification stage using
 * their preferred idea.
 */
export default function Research() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runResearch() {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await axios.post(`${baseUrl}/api/research`);
      setIdeas(res.data.ideas);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to run market research');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Market Research</h1>
      <p className="text-gray-700 mb-6">
        Click the button below to scrape data from platforms like Flippa and
        Product Hunt and discover validated app ideas.
      </p>
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
        onClick={runResearch}
        disabled={loading}
      >
        {loading ? 'Researching…' : 'Run Market Research'}
      </button>
      {error && <p className="mt-4 text-red-600">{error}</p>}
      <ul className="mt-8 space-y-6">
        {ideas.map((idea, idx) => (
          <li key={idx} className="p-4 bg-white shadow rounded">
            <h2 className="font-semibold text-lg mb-1">{idea.title}</h2>
            <p className="text-gray-700 mb-2">{idea.description}</p>
            {idea.url && (
              <a
                href={idea.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm block mb-2"
              >
                View source
              </a>
            )}
            {/* Link to specification page with idea encoded as query param */}
            <Link
              href={{ pathname: '/specification', query: { idea: idea.title } }}
              className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
            >
              Use this idea
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}