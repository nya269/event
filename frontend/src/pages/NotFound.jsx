import { Link } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/24/outline';

function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-display font-bold gradient-text mb-4">404</p>
        <h1 className="text-2xl font-semibold text-white mb-2">Page not found</h1>
        <p className="text-neutral-400 mb-8 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. Perhaps you've
          mistyped the URL or the page has been moved.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <HomeIcon className="w-5 h-5" />
          Go back home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;

