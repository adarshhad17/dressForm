import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
const ADMIN_USER = import.meta.env.VITE_ADMIN_USER || 'admin';

const inputCls =
  'w-full bg-pink-50 border border-pink-200 rounded-xl px-4 py-3 text-gray-900 text-sm outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-200 placeholder:text-pink-300 font-outfit';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      if (username === ADMIN_USER && password === ADMIN_PASSWORD) {
        sessionStorage.setItem('admin_auth', 'true');
        navigate('/admin');
      } else {
        setError('Invalid username or password.');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-white font-outfit flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-pink-50 border border-pink-200 text-pink-600 px-5 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5">
            🔐 Admin Access
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-br from-gray-900 via-pink-500 to-pink-700 bg-clip-text text-fill-transparent mb-2">
            Admin Login
          </h1>
          <p className="text-pink-600 text-sm">
            Sign in to manage dress form submissions
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-pink-100 rounded-2xl shadow-[0_8px_32px_rgba(236,72,153,0.12)] p-8">
          <form onSubmit={handleLogin} noValidate className="flex flex-col gap-5">

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-pink-700">
                Username
              </label>
              <input
                id="admin-username"
                className={inputCls}
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-pink-700">
                Password
              </label>
              <input
                id="admin-password"
                className={inputCls}
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-300 rounded-xl px-4 py-3 text-red-600 text-sm">
                ⚠️ {error}
              </div>
            )}

            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-pink-600 to-pink-800 text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(236,72,153,0.4)] hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : '🔓 Sign In'}
            </button>

          </form>
        </div>

        {/* Back link */}
        <div className="text-center mt-5">
          <a href="/"
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-pink-50 border border-pink-200 rounded-xl text-pink-700 text-sm font-semibold hover:border-pink-400 transition">
            ← Back to Form
          </a>
        </div>
      </div>
    </div>
  );
}
