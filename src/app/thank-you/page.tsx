import Link from 'next/link';

export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-lg text-center space-y-4">
        <h1 className="text-3xl font-bold">Thank You!</h1>
        <p className="text-muted-foreground">Your message has been received. We will get back to you soon.</p>
        <Link href="/" className="inline-flex items-center justify-center rounded-md bg-primary text-white px-4 py-2 hover:bg-primary-hover">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
