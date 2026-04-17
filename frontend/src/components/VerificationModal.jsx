import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, AlertCircle, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockVerify } from '../utils/mockVerify';

export const VerificationModal = ({ article, onClose }) => {
  const { isAuthenticated, apiKey } = useAuth();
  
  const [status, setStatus] = useState('checking_prereqs'); // checking_prereqs, verifying, result, error
  const [result, setResult] = useState(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setStatus('needs_auth');
      return;
    }
    if (!apiKey) {
      setStatus('needs_key');
      return;
    }
    
    // Check if we already fetched to prevent Double-Calling in React StrictMode
    if (hasFetched.current) return;
    hasFetched.current = true;

    // Everything is good, start verifying
    setStatus('verifying');
    
    // Call the real API verification endpoint
    const verifyArticle = async () => {
      try {
        const res = await mockVerify(article.title, article.description || "", apiKey);
        if (res.verdict === "ERROR") {
          setStatus('error');
          setResult({ error: res.error });
        } else {
          const isReal = res.verdict === "REAL";
          setResult({
            isReal,
            confidence: res.confidence,
            reasoning: isReal 
              ? "No signs of manipulation detected. Sources align with trusted factual databases." 
              : "Significant inconsistencies found. Keywords match known misinformation campaigns."
          });
          setStatus('result');
        }
      } catch (err) {
        setStatus('error');
        setResult({ error: "Failed to verify article." });
      }
    };
    
    verifyArticle();
  }, [isAuthenticated, apiKey, article]);

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 w-full max-w-lg shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="font-bold uppercase tracking-wider text-sm flexitems-center gap-2">
            <div className="w-2 h-2 bg-black dark:bg-white rounded-full inline-block mr-2" />
            TruthX Verification
          </h3>
          <button onClick={onClose} className="text-neutral-500 hover:text-black dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 border-l-4 border-l-black dark:border-l-white">
            <h4 className="font-serif font-bold text-lg mb-1 leading-tight">{article.title}</h4>
            <p className="text-xs text-neutral-500 uppercase font-bold tracking-widest">{article.category} • {article.date}</p>
          </div>

          {/* States */}
          {status === 'needs_auth' && (
            <div className="text-center py-8">
              <AlertCircle size={48} className="mx-auto text-neutral-400 mb-4" />
              <h4 className="text-xl font-bold mb-2">Authentication Required</h4>
              <p className="text-neutral-500 mb-6">You must be logged in to verify news articles using the TruthX system.</p>
              <Link to="/auth" onClick={onClose} className="inline-block bg-black text-white dark:bg-white dark:text-black font-bold uppercase tracking-widest text-sm px-6 py-3 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors">
                Log In or Sign Up
              </Link>
            </div>
          )}

          {status === 'needs_key' && (
            <div className="text-center py-8">
              <AlertCircle size={48} className="mx-auto text-neutral-400 mb-4" />
              <h4 className="text-xl font-bold mb-2">API Key Required</h4>
              <p className="text-neutral-500 mb-6">A valid TruthX API key is required to query the verification engine.</p>
              <Link to="/api-settings" onClick={onClose} className="inline-block bg-black text-white dark:bg-white dark:text-black font-bold uppercase tracking-widest text-sm px-6 py-3 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors">
                Configure API Key
              </Link>
            </div>
          )}

          {status === 'verifying' && (
            <div className="text-center py-12 flex flex-col items-center">
              <Loader2 size={48} className="text-black dark:text-white mb-4 animate-spin" />
              <h4 className="text-lg font-bold uppercase tracking-widest mb-2 animate-pulse">Analyzing Sources...</h4>
              <p className="text-neutral-500 text-sm">TruthX is cross-referencing this article against known databases.</p>
            </div>
          )}

          {status === 'result' && result && !result.error && (
            <div className="py-4">
              <div className={`p-6 border flex items-start gap-4 mb-4 ${
                result.isReal 
                  ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900 border-l-4 border-l-green-600' 
                  : 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900 border-l-4 border-l-red-600'
              }`}>
                {result.isReal ? <CheckCircle2 size={32} className="text-green-600 shrink-0" /> : <XCircle size={32} className="text-red-600 shrink-0" />}
                <div>
                  <h4 className={`text-2xl font-bold uppercase tracking-wider mb-1 ${result.isReal ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'}`}>
                    {result.isReal ? 'Real News ✅' : 'Fake News ❌'}
                  </h4>
                  <div className="text-sm font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span className="text-neutral-500">Confidence Score:</span>
                    <span className={result.isReal ? 'text-green-700 dark:text-green-500' : 'text-red-700 dark:text-red-500'}>
                      {result.confidence}%
                    </span>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    {result.reasoning}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="w-full bg-black text-white dark:bg-white dark:text-black font-bold uppercase tracking-widest text-sm px-6 py-3 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors">
                Done
              </button>
            </div>
          )}

          {status === 'error' && result?.error && (
            <div className="text-center py-8">
              <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
              <h4 className="text-xl font-bold mb-2 text-red-600">Verification Failed</h4>
              <p className="text-neutral-500 mb-6">{result.error}</p>
              <button onClick={onClose} className="inline-block bg-black text-white dark:bg-white dark:text-black font-bold uppercase tracking-widest text-sm px-6 py-3 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors">
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
