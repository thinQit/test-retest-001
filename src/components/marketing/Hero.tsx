import Link from 'next/link';
import Button from '@/components/ui/Button';

export function Hero() {
  return (
    <section className="px-6 md:px-12 py-16 bg-muted">
      <div className="mx-auto max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold">Launch your marketing site fast</h1>
          <p className="text-base md:text-lg text-muted-foreground">
            A clean landing page with dynamic features, a contact form, and secure admin APIs.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button>
              <Link href="/#contact">Get in touch</Link>
            </Button>
            <Button variant="outline">
              <Link href="/#features">Explore features</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
          <div className="space-y-3">
            <div className="h-3 w-1/2 bg-muted rounded" />
            <div className="h-3 w-full bg-muted rounded" />
            <div className="h-3 w-3/4 bg-muted rounded" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Built for speed, reliability, and growth.</p>
        </div>
      </div>
    </section>
  );
}

export default Hero;
