import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 text-gray-900">
            Secure Escrow Platform
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Safe and trusted escrow service for the Nigerian market
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/create">
              <Button size="lg" className="text-lg px-8">
                Create Escrow
              </Button>
            </Link>
            <Link href="/track">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Track Escrow
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

