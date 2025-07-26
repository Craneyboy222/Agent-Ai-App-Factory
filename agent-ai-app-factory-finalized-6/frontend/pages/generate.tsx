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
 * Code generation page.  Accepts a base64‑encoded specification via query param,
 * calls the code generation agent and stores the resulting codebase in
 * localStorage for later steps.  Displays a summary of the generated files
 * and provides navigation to the deployment stage.
 */
export default function GeneratePage() {
  const router = useRouter();
  const { spec } = router.query;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileCount, setFileCount] = useState<number | null>(null);

  useEffect(() => {
    async function runGeneration() {
      if (!spec || typeof spec !== 'string') return;
      let parsedSpec: Specification;
      try {
        // Decode the base64 encoded spec using the browser's atob function instead
        // of Node Buffer so that this runs correctly client-side.
        parsedSpec = JSON.parse(atob(spec));
      } catch (e) {
        console.error('Failed to decode spec', e);
        setError('Invalid specification provided');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const url = baseUrl ? `${baseUrl}/api/generate-code` : '/api/generate-code';
        const res = await axios.post(url, { spec: parsedSpec });
        const code = res.data as Record<string, string>;
        // Save code in localStorage for later steps
        if (typeof window !== 'undefined') {
          localStorage.setItem('generatedCode', JSON.stringify(code));
          localStorage.setItem('generatedSpec', JSON.stringify(parsedSpec));
        }
        setFileCount(Object.keys(code).length);
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.message || err?.message || 'Failed to generate code');
      } finally {
        setLoading(false);
      }
    }
    runGeneration();
  }, [spec]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Code Generation</h1>
      {loading && <p>Generating code… this can take a few minutes.</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && fileCount !== null && (
        <div className="space-y-4">
          <p className="text-gray-700">Generation complete. {fileCount} files produced.</p>
          <Link
            href="/deploy"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded"
          >
            Continue to Deployment
          </Link>
        </div>
      )}
    </div>
  );
}