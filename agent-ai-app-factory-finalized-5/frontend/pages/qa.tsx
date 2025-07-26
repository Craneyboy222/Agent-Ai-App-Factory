import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

/**
 * QA page.  Loads the generated code from localStorage and sends it to the QA
 * agent for testing.  Displays the test output and provides navigation to the
 * marketplace listing stage.
 */
export default function QaPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<string | null>(null);

  function loadCode(): Record<string, string> | null {
    if (typeof window === 'undefined') return null;
    try {
      const codeStr = localStorage.getItem('generatedCode');
      return codeStr ? JSON.parse(codeStr) : null;
    } catch (e) {
      console.error('Failed to parse code from localStorage');
      return null;
    }
  }

  async function runTests() {
    const code = loadCode();
    if (!code) {
      setError('No generated code found. Please run code generation first.');
      return;
    }
    setLoading(true);
    setError(null);
    setOutput(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await axios.post(`${baseUrl}/api/qa`, { code });
      setOutput(res.data.output);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to run tests');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Quality Assurance</h1>
      <p className="mb-4 text-gray-700">
        Run unit and end‑to‑end tests on your generated application.
      </p>
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
        onClick={runTests}
        disabled={loading}
      >
        {loading ? 'Running tests…' : 'Run Tests'}
      </button>
      {error && <p className="mt-4 text-red-600">{error}</p>}
      {output && (
        <div className="mt-6">
          <h2 className="font-semibold text-lg mb-2">Test Output</h2>
          <pre className="bg-gray-100 p-3 rounded overflow-x-auto whitespace-pre-wrap text-sm">
            {output}
          </pre>
          <Link
            href="/listing"
            className="inline-block mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded"
          >
            Continue to Marketplace Listing
          </Link>
        </div>
      )}
    </div>
  );
}