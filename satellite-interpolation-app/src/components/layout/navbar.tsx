import Link from 'next/link';
import { Satellite } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center mx-auto px-4">
        <div className="flex items-center gap-2 font-bold">
          <Satellite className="h-6 w-6 text-primary" />
          <Link href="/">Fill the Frames</Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-4">
            <Link href="/dashboard/upload" className="text-sm font-medium transition-colors hover:text-primary">
              Dashboard
            </Link>
            <Link href="/dashboard/about" className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground">
              About
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
