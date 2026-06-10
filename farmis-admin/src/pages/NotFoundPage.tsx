import { Link } from 'react-router-dom';
import { Button } from '@/components/common';

export default function NotFoundPage() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-brand-700">
          404
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-ink-800">
          Page not found
        </h1>
        <p className="mt-2 max-w-sm text-sm text-ink-400">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="mt-6 inline-block">
          <Button>Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
