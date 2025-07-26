import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Analytics {
  dailyActiveUsers: number;
  monthlyRevenue: number;
  avgSessionTime: number;
  featureUsageStats: Record<string, number>;
}

/**
 * Analytics page.  Displays key metrics for a deployed app using its ID.  The
 * page uses a dynamic route (`/analytics/[appId]`) and fetches analytics via
 * the feedback agent.
 */
export default function AnalyticsPage() {
  const router = useRouter();
  const { appId } = router.query;
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!appId || typeof appId !== 'string') return;
      setLoading(true);
      setError(null);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const res = await axios.get(`${baseUrl}/api/analytics/${appId}`);
        setData(res.data);
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.message || 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [appId]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">App Analytics</h1>
      {loading && <p>Loading analytics…</p>}
      {error && <p className="text-red-600">{error}</p>}
      {data && (
        <div className="space-y-4">
          <div className="p-4 bg-white shadow rounded">
            <h2 className="font-semibold mb-1">Daily Active Users</h2>
            <p>{data.dailyActiveUsers}</p>
          </div>
          <div className="p-4 bg-white shadow rounded">
            <h2 className="font-semibold mb-1">Monthly Revenue</h2>
            <p>${data.monthlyRevenue.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-white shadow rounded">
            <h2 className="font-semibold mb-1">Average Session Time (min)</h2>
            <p>{data.avgSessionTime.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-white shadow rounded">
            <h2 className="font-semibold mb-1">Feature Usage</h2>
            <ul className="list-disc list-inside space-y-1">
              {Object.entries(data.featureUsageStats).map(([feature, value]) => (
                <li key={feature}>
                  {feature}: {value}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}