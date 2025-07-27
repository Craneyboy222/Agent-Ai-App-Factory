import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface Specification {
  features: string;
  databaseSchema: string;
  apiSpec: string;
  wireframes: string;
  monetization: string;
  techStack: string;
}

/**
 * Specification page.  Reads the selected idea from the URL query, calls the
 * specification agent to generate a full technical specification and
 * displays the result.  Provides a link to proceed to code generation.
 */
export default function SpecificationPage() {
  const router = useRouter();
  const { idea } = router.query;
  const [spec, setSpec] = useState<Specification | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSpec() {
      if (!idea || typeof idea !== 'string') return;
      setLoading(true);
      setError(null);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        // Fallback to a relative path when no base URL is provided to avoid CORS issues
        const url = baseUrl ? `${baseUrl}/api/specification` : '/api/specification';
        const res = await axios.post(url, { idea });
        setSpec(res.data);
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.message || err?.message || 'Failed to generate specification');
      } finally {
        setLoading(false);
      }
    }
    fetchSpec();
  }, [idea]);

  // Encode specification as base64 JSON for passing to the next step.  Using
  // btoa avoids relying on Node's Buffer API in the browser.
  const encodedSpec = spec ? btoa(JSON.stringify(spec)) : '';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Specification</h1>
      {loading && <p>Generating specification…</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && spec && (
        <div className="space-y-6">
          <div>
            <h2 className="font-semibold text-lg mb-1">Features</h2>
            <pre className="bg-gray-100 p-2 rounded overflow-x-auto whitespace-pre-wrap">
              {spec.features}
            </pre>
          </div>
          <div>
            <h2 className="font-semibold text-lg mb-1">Database Schema</h2>
            <pre className="bg-gray-100 p-2 rounded overflow-x-auto whitespace-pre-wrap">
              {spec.databaseSchema}
            </pre>
          </div>
          <div>
            <h2 className="font-semibold text-lg mb-1">API Specification</h2>
            <pre className="bg-gray-100 p-2 rounded overflow-x-auto whitespace-pre-wrap">
              {spec.apiSpec}
            </pre>
          </div>
          <div>
            <h2 className="font-semibold text-lg mb-1">Wireframes & User Flows</h2>
            <pre className="bg-gray-100 p-2 rounded overflow-x-auto whitespace-pre-wrap">
              {spec.wireframes}
            </pre>
          </div>
          <div>
            <h2 className="font-semibold text-lg mb-1">Monetization & Pricing</h2>
            <pre className="bg-gray-100 p-2 rounded overflow-x-auto whitespace-pre-wrap">
              {spec.monetization}
            </pre>
          </div>
          <div>
            <h2 className="font-semibold text-lg mb-1">Technology Stack</h2>
            <pre className="bg-gray-100 p-2 rounded overflow-x-auto whitespace-pre-wrap">
              {spec.techStack}
            </pre>
          </div>
          {/* Link to code generation page with encoded spec */}
          <Link
            href={{ pathname: '/generate', query: { spec: encodedSpec } }}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
          >
            Generate Code
          </Link>
        </div>
      )}
    </div>
  );
}
