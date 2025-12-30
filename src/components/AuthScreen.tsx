import { useState } from 'react';
import { useAuthStore, initializeMockData } from '../store';
import { FileText, Loader2 } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot';

export function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, register } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        const user = useAuthStore.getState().currentUser;
        if (user) initializeMockData(user.id);
      } else if (mode === 'register') {
        await register(name, email, password);
        const user = useAuthStore.getState().currentUser;
        if (user) initializeMockData(user.id);
      } else {
        // Forgot password - mock flow
        await new Promise(resolve => setTimeout(resolve, 1000));
        setMode('login');
        setError('Password reset link sent to your email');
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl mb-4 shadow-lg shadow-indigo-200">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-slate-900 mb-2">DocuVault</h1>
          <p className="text-slate-600">Enterprise document management made simple</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
          <div className="mb-6">
            <h2 className="text-slate-900 mb-1">
              {mode === 'login' && 'Welcome back'}
              {mode === 'register' && 'Create your account'}
              {mode === 'forgot' && 'Reset password'}
            </h2>
            <p className="text-slate-600">
              {mode === 'login' && 'Sign in to access your documents'}
              {mode === 'register' && 'Get started with DocuVault today'}
              {mode === 'forgot' && 'Enter your email to receive a reset link'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label htmlFor="name" className="block text-slate-700 mb-2">
                  Full name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Alex Morgan"
                  required
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-slate-700 mb-2">
                Email address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
                required
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <label htmlFor="password" className="block text-slate-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {mode === 'login' && 'Sign in'}
                  {mode === 'register' && 'Create account'}
                  {mode === 'forgot' && 'Send reset link'}
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            {mode === 'login' && (
              <>
                <button
                  onClick={() => setMode('forgot')}
                  className="text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Forgot password?
                </button>
                <div className="text-slate-600">
                  Don't have an account?{' '}
                  <button
                    onClick={() => setMode('register')}
                    className="text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    Sign up
                  </button>
                </div>
              </>
            )}
            {mode === 'register' && (
              <div className="text-slate-600">
                Already have an account?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Sign in
                </button>
              </div>
            )}
            {mode === 'forgot' && (
              <button
                onClick={() => setMode('login')}
                className="text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Back to sign in
              </button>
            )}
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-slate-100 rounded-xl border border-slate-200">
          <p className="text-slate-700 mb-2">Demo credentials:</p>
          <p className="text-slate-600 text-sm">
            <strong>Editor:</strong> demo@example.com / password
          </p>
          <p className="text-slate-600 text-sm">
            <strong>Admin:</strong> admin@example.com / password
          </p>
        </div>
      </div>
    </div>
  );
}
