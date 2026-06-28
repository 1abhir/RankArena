import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 border-b border-hair bg-ink/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-lg font-bold tracking-tight text-bone">
          Rank<span className="text-signal">Arena</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-ash">
          <Link to="/leaderboard" className="hover:text-bone transition-colors">Leaderboard</Link>
          {user ? (
            <>
              <Link to="/home" className="hover:text-bone transition-colors">Home</Link>
              <Link to="/jobs" className="hover:text-bone transition-colors">Jobs</Link>
              <Link to="/dashboard" className="hover:text-bone transition-colors">Dashboard</Link>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="rounded-md border border-hair px-3 py-1.5 text-bone hover:border-signal hover:text-signal transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-bone transition-colors">Log in</Link>
              <Link
                to="/signup"
                className="rounded-md bg-signal px-3 py-1.5 font-medium text-ink hover:bg-signal/90 transition-colors"
              >
                Join the ladder
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
