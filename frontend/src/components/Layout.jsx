import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, User, KeySquare, LogOut } from 'lucide-react';

const Logo = () => (
  <Link to="/" className="flex items-center">
    {/* Truth part: white text, black bg */}
    <div className="bg-black text-white px-2 py-1 font-bold text-xl uppercase tracking-tighter border-2 border-black">
      Truth
    </div>
    {/* X part: black text, white bg */}
    <div className="bg-white text-black px-2 py-1 font-bold text-xl uppercase tracking-tighter border-2 border-black border-l-0">
      X
    </div>
  </Link>
);

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="w-full border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black transition-colors duration-300 top-0 sticky z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Left: Logo */}
        <div className="flex-shrink-0">
          <Logo />
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden md:flex space-x-8 text-sm font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-300">
          <Link to="/" className="hover:text-black dark:hover:text-white transition-colors">About</Link>
          <Link to="/" className="hover:text-black dark:hover:text-white transition-colors">Science</Link>
          <Link to="/" className="hover:text-black dark:hover:text-white transition-colors">Economy</Link>
          <Link to="/" className="hover:text-black dark:hover:text-white transition-colors">Business</Link>
          <Link to="/" className="hover:text-black dark:hover:text-white transition-colors">Contact</Link>
        </div>

        {/* Right: Search + Auth/API tools */}
        <div className="flex items-center space-x-4">
          <button className="text-neutral-500 hover:text-black dark:hover:text-white transition-colors p-2">
            <Search size={20} />
          </button>

          <Link to="/api-settings" className="text-neutral-500 hover:text-black dark:hover:text-white transition-colors p-2" title="API Settings">
            <KeySquare size={20} />
          </Link>

          {isAuthenticated ? (
            <button onClick={logout} className="text-neutral-500 hover:text-black dark:hover:text-white transition-colors p-2" title="Logout">
              <LogOut size={20} />
            </button>
          ) : (
            <Link to="/auth" className="text-neutral-500 hover:text-black dark:hover:text-white transition-colors p-2" title="Login">
              <User size={20} />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer matching standard modern style */}
      <footer className="bg-black text-white py-12 mt-12 w-full">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center space-y-8">
          <div className="text-center">
            <Logo />
          </div>
          <div className="flex space-x-6 text-sm font-bold uppercase tracking-widest text-neutral-400">
            <Link to="/" className="hover:text-white">About</Link>
            <Link to="/" className="hover:text-white">Science</Link>
            <Link to="/" className="hover:text-white">Economy</Link>
            <Link to="/" className="hover:text-white">Business</Link>
          </div>
          <p className="text-neutral-500 text-sm">© 2026 TruthX platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
