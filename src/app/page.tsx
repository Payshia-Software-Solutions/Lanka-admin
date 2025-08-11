
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="text-center space-y-8">
        <div className="flex justify-center items-center gap-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-16 w-16 text-primary"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
          <h1 className="text-5xl font-bold font-headline text-foreground">
            Lanka Admin
          </h1>
        </div>
        <p className="text-xl text-muted-foreground">
          Your all-in-one solution for managing tourism websites.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Button asChild size="lg" className="text-lg py-6 px-8">
            <Link href="/admin/login">Log In</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg py-6 px-8">
            <Link href="/admin/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
