import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Leaderboard from './pages/Leaderboard';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import { useAuth } from './context/AuthContext';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="px-6 py-20 text-center text-ash">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/jobs" element={<PrivateRoute><Jobs /></PrivateRoute>} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}
