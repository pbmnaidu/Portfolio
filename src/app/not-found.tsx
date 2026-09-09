import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-portfolio-bg text-portfolio-text font-display flex flex-col items-center justify-center p-6 text-center">
      <div className="font-mono text-7xl font-extrabold text-portfolio-accent mb-4">404</div>
      <h1 className="text-2xl md:text-3xl font-bold mb-2">Page Not Found</h1>
      <p className="font-mono text-xs text-portfolio-muted max-w-md mb-8">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="font-mono text-xs tracking-widest uppercase px-6 py-3 bg-portfolio-accent text-black font-bold rounded-lg hover:opacity-90 transition-opacity"
      >
        Return to Home
      </Link>
    </div>
  );
}
