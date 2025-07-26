import { useState } from 'react';
import axios from 'axios';

interface Idea {
  title: string;
  description: string;
  price?: number;
  url?: string;
}

export default function Home() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(false);
  const runResearch = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:4000/api/research');
      setIdeas(res.data.ideas);
    } catch (err) {
      console.error(err);
      alert('Failed to run market research');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-8">
      <h1 className="text-3xl font-bold mb-6">Agent‑AI‑App‑Factory</h1>
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
        onClick={runResearch}
        disabled={loading}
      >
        {loading ? 'Researching…' : 'Run Market Research'}
      </button>
      <ul className="mt-6 space-y-4">
        {ideas.map((idea, idx) => (
          <li key={idx} className="p-4 bg-white shadow rounded">
            <h2 className="font-semibold text-lg">{idea.title}</h2>
            <p className="mt-1 text-sm text-gray-700">{idea.description}</p>
            {idea.url && (
              <a
                href={idea.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-blue-600 hover:underline text-sm"
              >
                View source
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}