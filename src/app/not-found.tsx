import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-muted-foreground">The page you are looking for does not exist.</p>
        <Link href="/" className="inline-flex items-center justify-center rounded-md bg-primary text-white px-4 py-2 hover:bg-primary-hover">
          Go Home
        </Link>
      </div>
    </div>
  );
}
