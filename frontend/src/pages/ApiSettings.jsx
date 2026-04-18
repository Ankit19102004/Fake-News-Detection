import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { KeySquare, CheckCircle2, Copy, Eye, EyeOff } from 'lucide-react';

export const ApiSettings = () => {
  const { apiKey } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const handleCopy = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto mt-16 px-4">
      <div className="mb-12">
        <h1 className="text-4xl font-serif font-bold mb-4 flex items-center gap-3">
          <KeySquare className="text-neutral-400" size={32} />
          TruthX API Configuration
        </h1>
        <p className="text-neutral-500 font-medium">
          This is your personal developer API key to verify articles against the TruthX system. Keep it secure.
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8">
        <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">
          API Secret Key
        </label>
        <div className="relative mb-6">
          <input
            type={showKey ? "text" : "password"}
            readOnly
            value={apiKey || "Not generated yet"}
            className="w-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-4 py-3 pr-12 focus:outline-none transition-colors text-neutral-600 dark:text-neutral-300"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            disabled={!apiKey}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors disabled:opacity-50"
            title={showKey ? "Hide key" : "Show key"}
          >
            {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!apiKey}
            className="bg-black text-white dark:bg-white dark:text-black font-bold uppercase tracking-widest text-sm px-8 py-3 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Copy size={16} />
            Copy Key
          </button>

          {copied && (
            <span className="text-green-600 dark:text-green-500 flex items-center gap-2 ml-auto font-bold uppercase tracking-widest text-sm animate-in fade-in">
              <CheckCircle2 size={18} />
              Copied!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
