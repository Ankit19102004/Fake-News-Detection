import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Link as LinkIcon, AlertCircle } from 'lucide-react';

export const VerifyUrl = () => {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!url) return;
    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL.");
      setStatus('error');
      return;
    }

    setStatus('loading');
    setError('');

    try {
      const response = await fetch("http://localhost:5000/extract_metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Navigate to Article page with extracted data
      navigate('/article', {
        state: {
          article: {
            title: data.title || "Scraped URL Article",
            description: data.description || `Article extracted from ${url}`,
            url: url,
            image: data.image || "https://via.placeholder.com/800x400?text=Article+Image",
            category: "URL Scan",
            date: new Date().toDateString()
          }
        }
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch URL. Please try again.");
      setStatus('error');
    }
  };

  return (
    <div className="max-w-[75%] mx-auto px-4 py-12">
      <div className="mb-12 border-b border-black pb-8 dark:border-white">
        <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-tight mb-4 leading-none">
          Verify via URL
        </h1>
        <p className="text-xl text-neutral-500 max-w-2xl font-bold uppercase tracking-widest">
          Paste a link to any news article or post to scrape and verify its contents.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="flex flex-col gap-6 p-8 border border-black dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 shadow-sm">
          <div>
            <label className="flex text-sm font-bold uppercase tracking-wider mb-2 items-center gap-2">
              <LinkIcon size={16} /> Article / Post Link
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/news-article..."
              className="w-full p-4 border border-black dark:border-neutral-700 bg-transparent focus:ring-2 focus:ring-black dark:focus:ring-white transition outline-none"
              required
            />
          </div>

          {status === 'error' && (
            <div className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-800 flex items-center gap-3">
              <AlertCircle size={20} />
              <p className="font-medium text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading' || !url}
            className="w-full h-14 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {status === 'loading' ? <><Loader2 className="animate-spin" size={20} /> Fetching Link...</> : 'Search to Verify'}
          </button>
        </form>
      </div>
    </div>
  );
};
