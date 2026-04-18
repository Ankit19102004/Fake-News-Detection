import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 px-4">
      <div className="bg-white dark:bg-neutral-900 border border-black dark:border-white p-8">
        <h2 className="text-3xl font-serif font-bold mb-6 text-center">
          {isLogin ? 'Welcome Back' : 'Join TruthX'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-black dark:border-white bg-transparent py-2 focus:outline-none focus:border-neutral-500 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-black dark:border-white bg-transparent py-2 focus:outline-none focus:border-neutral-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white dark:bg-white dark:text-black font-bold uppercase tracking-widest text-sm py-4 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors mt-8 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-neutral-500 hover:text-black dark:hover:text-white font-bold transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
};
