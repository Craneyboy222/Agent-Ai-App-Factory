import Link from 'next/link';

/**
 * Home page for the Agent‑AI‑App‑Factory frontend.  This page serves as an entry
 * point into the autonomous app generation pipeline.  It introduces the
 * platform and provides navigation to each stage of the workflow: market
 * research, specification, code generation, deployment, QA, listing and
 * analytics.  The actual functionality is implemented in the corresponding
 * pages under `pages/`.
 */
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Agent‑AI‑App‑Factory</h1>
      <p className="text-lg text-gray-700 max-w-2xl text-center mb-8">
        Welcome to the Agent‑AI‑App‑Factory. This platform harnesses multiple AI
        agents to research markets, design specifications, generate code,
        deploy applications, run quality assurance and publish to a
        marketplace—all autonomously. Follow the steps below to create your
        next enterprise app.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
        <Link href="/research">
          <div className="p-6 bg-white rounded-lg shadow hover:shadow-md transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">1. Market Research</h2>
            <p className="text-gray-600">Discover trending industries and validate ideas.</p>
          </div>
        </Link>
        <Link href="/specification">
          <div className="p-6 bg-white rounded-lg shadow hover:shadow-md transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">2. Specification</h2>
            <p className="text-gray-600">Generate a comprehensive technical spec for your idea.</p>
          </div>
        </Link>
        <Link href="/generate">
          <div className="p-6 bg-white rounded-lg shadow hover:shadow-md transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">3. Code Generation</h2>
            <p className="text-gray-600">Produce a complete, enterprise‑grade codebase.</p>
          </div>
        </Link>
        <Link href="/deploy">
          <div className="p-6 bg-white rounded-lg shadow hover:shadow-md transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">4. Deployment</h2>
            <p className="text-gray-600">Push the code to GitHub and deploy to Vercel.</p>
          </div>
        </Link>
        <Link href="/qa">
          <div className="p-6 bg-white rounded-lg shadow hover:shadow-md transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">5. QA</h2>
            <p className="text-gray-600">Run automated tests and review results.</p>
          </div>
        </Link>
        <Link href="/listing">
          <div className="p-6 bg-white rounded-lg shadow hover:shadow-md transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">6. Marketplace Listing</h2>
            <p className="text-gray-600">Create a compelling sales page for your app.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}