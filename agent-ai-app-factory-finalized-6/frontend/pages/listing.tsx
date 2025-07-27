import { useState } from 'react';
import axios from 'axios';

interface Listing {
  title: string;
  tagline: string;
  description: string;
  // Features are stored as a list of strings
  features: string[];
  pricing: string;
  screenshots: string[];
  flippaUrl?: string;
  internalUrl?: string;
}

/**
 * Marketplace listing page.  Uses the specification and live URL stored
 * locally to generate a sales listing via the marketplace agent.  Displays
 * the listing details once created.
 */
export default function ListingPage() {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadSpecAndUrl() {
    if (typeof window === 'undefined') return { spec: null, liveUrl: null };
    let spec = null;
    let liveUrl = null;
    try {
      const specStr = localStorage.getItem('generatedSpec');
      spec = specStr ? JSON.parse(specStr) : null;
      liveUrl = localStorage.getItem('liveUrl');
    } catch (e) {
      console.error('Failed to load spec or live URL from localStorage');
    }
    return { spec, liveUrl };
  }

  async function createListing() {
    const { spec, liveUrl } = loadSpecAndUrl();
    if (!spec || !liveUrl) {
      setError('Missing specification or live URL. Complete previous steps first.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const url = baseUrl ? `${baseUrl}/api/listing` : '/api/listing';
      const res = await axios.post(url, { spec, liveUrl });
      setListing(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || err?.message || 'Failed to generate listing');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Marketplace Listing</h1>
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
        onClick={createListing}
        disabled={loading}
      >
        {loading ? 'Generating listing…' : 'Generate Listing'}
      </button>
      {error && <p className="mt-4 text-red-600">{error}</p>}
      {listing && (
        <div className="mt-6 space-y-4">
          <h2 className="text-2xl font-bold">{listing.title}</h2>
          <p className="text-gray-700 italic">{listing.tagline}</p>
          <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
          <div>
            <h3 className="font-semibold mb-1">Features</h3>
            <pre className="bg-gray-100 p-3 rounded whitespace-pre-wrap text-sm">
              {listing.features.join('\n')}
            </pre>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Pricing</h3>
            <p className="text-gray-700">{listing.pricing}</p>
          </div>
          {listing.screenshots && listing.screenshots.length > 0 && (
            <div>
              <h3 className="font-semibold mb-1">Screenshots</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {listing.screenshots.map((src, idx) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={idx}
                    src={src}
                    alt={`Screenshot ${idx + 1}`}
                    className="w-full h-auto rounded border"
                  />
                ))}
              </div>
            </div>
          )}
          {(listing.flippaUrl || listing.internalUrl) && (
            <div>
              {listing.flippaUrl && (
                <p>
                  Flippa Listing:{' '}
                  <a
                    href={listing.flippaUrl}
                    className="text-blue-600 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {listing.flippaUrl}
                  </a>
                </p>
              )}
              {listing.internalUrl && (
                <p>
                  Internal Listing:{' '}
                  <a
                    href={listing.internalUrl}
                    className="text-blue-600 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {listing.internalUrl}
                  </a>
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}