import type { Metadata } from 'next';
import './globals.css';
import CustomCursor from '@/components/CustomCursor';

export const metadata: Metadata = {
  title: 'Bhanu Prakash — Portfolio',
  description: 'B.Tech CSE (AI) student at Vignan Institute of Information Technology. Portfolio & Projects.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Synchronous Inline Script to prevent Flash Of Unstyled Content / Color Flicker on Reload
  const foucPreventionScript = `
    (function() {
      try {
        var rawData = localStorage.getItem("portfolioData");
        if (rawData) {
          var parsed = JSON.parse(rawData);
          var t = (parsed && parsed.theme) ? parsed.theme : parsed;
          var root = document.documentElement;
          if (t && t.bg) root.style.setProperty("--bg", t.bg);
          if (t && t.surface) root.style.setProperty("--surface", t.surface);
          if (t && t.accent) root.style.setProperty("--accent", t.accent);
          if (t && t.text) root.style.setProperty("--text", t.text);
          if (t && t.muted) root.style.setProperty("--muted", t.muted);
          if (t && t.border) root.style.setProperty("--border", t.border);
          root.setAttribute("data-cursor-style", (t && t.cursorStyle) ? t.cursorStyle : "ring");
          root.setAttribute("data-bg-pattern", (t && t.bgPattern) ? t.bgPattern : "grid");
        } else {
          document.documentElement.setAttribute("data-bg-pattern", "grid");
        }
      } catch (e) {
        document.documentElement.setAttribute("data-bg-pattern", "grid");
      }
    })();
  `;

  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        <script dangerouslySetInnerHTML={{ __html: foucPreventionScript }} />
      </head>
      <body className="antialiased selection:bg-portfolio-accent selection:text-black">
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
