import { Button } from '@/components/ui/button';
import Image from 'next/image';

import './globals.css';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center mb-8">
        <div className="">
          <Image
            src={'/404.svg'}
            alt="sample image"
            width={300}
            height={200}
            className="mx-auto"
          />
        </div>
        <h2 className="text-2xl font-bold mb-12">
          Ooops, looks like the page you're looking was not found
        </h2>
        <Link href="/dashboard">
          <Button
            size="lg"
            className="bg-black hover:bg-black-200 text-white px-8 py-3"
          >
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
