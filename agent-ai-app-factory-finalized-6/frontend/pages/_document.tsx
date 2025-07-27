import { Html, Head, Main, NextScript } from 'next/document';

/**
 * Custom Document to inject a small SVG favicon into the head. This avoids
 * requests for /favicon.ico which would otherwise return 404.
 */
export default function Document() {
  return (
    <Html>
      <Head>
        {/* Embeds a simple emoji as a favicon. Replace the SVG if you prefer another icon. */}
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚀</text></svg>"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
