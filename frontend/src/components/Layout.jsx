import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, User, KeySquare, LogOut } from 'lucide-react';

const Logo = () => (
  <Link to="/" className="flex items-center border">
    {/* Truth part: white text, black bg */}
    <div className="bg-black text-white px-2 py-1 font-bold text-xl uppercase tracking-tighter border-2 border-white">
      Truth
    </div>
    {/* X part: black text, white bg */}
    <div className="bg-white text-black px-2 py-1 font-bold text-xl uppercase tracking-tighter border-2 border-white border-l-0">
      X
    </div>
  </Link>
);

const Navbar = ({ setCategory }) => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleCategoryClick = (cat) => {
    setCategory(cat);
    navigate('/');
  };

  return (
    <nav className="w-full bg-black top-0 sticky z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Left: Logo */}
        <div className="shrink-0">
          <Logo />
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden md:flex space-x-8 text-sm font-bold uppercase tracking-[0.15em] text-white">
          <button onClick={() => handleCategoryClick('top stories')} className="hover:text-neutral-400 transition-colors">Top Stories</button>
          <button onClick={() => handleCategoryClick('india')} className="hover:text-neutral-400 transition-colors">India</button>
          <button onClick={() => handleCategoryClick('science')} className="hover:text-neutral-400 transition-colors">Science</button>
          <button onClick={() => handleCategoryClick('economy')} className="hover:text-neutral-400 transition-colors">Economy</button>
          <button onClick={() => handleCategoryClick('business')} className="hover:text-neutral-400 transition-colors">Business</button>
          <button onClick={() => handleCategoryClick('explore')} className="hover:text-neutral-400 transition-colors border-r border-white/20 pr-8">Explore</button>
          
          <div className="relative group flex items-center">
            <span className="hover:text-neutral-400 transition-colors cursor-pointer flex items-center gap-1">
              Verify
              <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </span>
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-0 pt-6 w-48 opacity-0 group-hover:opacity-100 transition-all duration-300 invisible group-hover:visible z-50">
              <div className="bg-black/95 backdrop-blur-md border border-white/10 rounded shadow-2xl flex flex-col py-2 overflow-hidden">
                <Link to="/verify" className="px-4 py-3 hover:bg-white/10 transition-colors text-white tracking-widest text-xs border-b border-white/5">Enter News</Link>
                <Link to="/verify-url" className="px-4 py-3 hover:bg-white/10 transition-colors text-white tracking-widest text-xs">Verify via Link</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Search + Auth/API tools */}
        <div className="flex items-center space-x-4">
          <button className="text-white hover:text-neutral-400 transition-colors p-2">
            <Search size={20} />
          </button>

          <Link to="/api-settings" className="text-white hover:text-neutral-400 transition-colors p-2" title="API Settings">
            <KeySquare size={20} />
          </Link>

          {isAuthenticated ? (
            <button onClick={logout} className="text-white hover:text-neutral-400 transition-colors p-2" title="Logout">
              <LogOut size={20} />
            </button>
          ) : (
            <Link to="/auth" className="text-white hover:text-neutral-400 transition-colors p-2" title="Login">
              <User size={20} />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export const Layout = ({ setCategory }) => {
  const navigate = useNavigate();

  const handleCategoryClick = (cat) => {
    setCategory(cat);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300">

      {/* Pass SAME handler */}
      <Navbar setCategory={setCategory} />

      <main className="grow">
        <Outlet />
      </main>

      <footer className="bg-black text-white py-12 mt-12 w-full">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center space-y-8">

          <div className="text-center">
            <Logo />
          </div>

          <div className="flex space-x-6 text-sm font-bold uppercase tracking-widest text-neutral-400">
            <Link to="/verify" className="hover:text-white">Verify</Link>

            {/* Use same logic */}
            <button onClick={() => handleCategoryClick('about')} className="hover:text-white">About</button>
            <button onClick={() => handleCategoryClick('science')} className="hover:text-white">Science</button>
            <button onClick={() => handleCategoryClick('economy')} className="hover:text-white">Economy</button>
            <button onClick={() => handleCategoryClick('business')} className="hover:text-white">Business</button>
          </div>

          <p className="text-neutral-500 text-sm">© 2026 TruthX platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
