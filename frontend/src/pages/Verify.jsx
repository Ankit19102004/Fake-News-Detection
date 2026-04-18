import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Loader2 } from 'lucide-react';
import { mockVerify } from '../utils/mockVerify';

export const Verify = () => {
  const { isAuthenticated, apiKey } = useAuth();
  
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  
  const [status, setStatus] = useState('idle'); // idle, verifying, result, error, needs_auth
  const [result, setResult] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!title && !text) {
      alert('Please enter a title or text to verify.');
      return;
    }
    
    if (!isAuthenticated) {
      setStatus('needs_auth');
      return;
    }
    if (!apiKey) {
      setStatus('needs_key');
      return;
    }

    setStatus('verifying');
    try {
      const res = await mockVerify(title, text, apiKey);
      if (res.verdict === "ERROR") {
        setStatus('error');
        setResult({ error: res.error });
      } else {
        const aiConfidence = Math.round(res.confidence * 100);
        const externalScore = res.external_score !== undefined
          ? Math.round(res.external_score * 100)
          : null;
        const overallScore = res.final_score !== undefined
          ? Math.round(res.final_score * 100)
          : externalScore !== null
            ? Math.round((aiConfidence * 0.65) + (externalScore * 0.35))
            : aiConfidence;

        const isReal = res.original_prediction === "Real News";
        const conflict = res.conflict_detected || false;

        let label = "";
        if (conflict) {
          label = "Conflicting Evidence";
        } else if (overallScore >= 75) {
          label = isReal ? "Verified Real" : "Verified Fake";
        } else if (overallScore >= 60) {
          label = isReal ? "Likely Real" : "Likely Fake";
        } else {
          label = isReal
            ? "Uncertain (Leaning Real)"
            : "Uncertain (Leaning Fake)";
        }

        let reasoning = "";
        if (conflict) {
          reasoning = "AI predictions and external sources provide conflicting signals.";
        } else if (overallScore >= 75) {
          reasoning = isReal
            ? "Strong agreement across AI models and external sources."
            : "Strong indicators suggest this content is misleading.";
        } else if (overallScore >= 60) {
          reasoning = isReal
            ? "Moderate confidence. Most signals suggest this is reliable."
            : "Moderate confidence. Some signals suggest this may be misleading.";
        } else {
          reasoning = "Low confidence. Mixed signals detected.";
        }

        setResult({
          aiConfidence,
          externalScore,
          overallScore,
          label,
          reasoning,
          conflict,
          isReal
        });
        setStatus('result');
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setStatus('error');
      setResult({ error: "Failed to verify article." });
    }
  };

  const getStyles = () => {
    if (!result) return {};
    if (result.conflict) {
      return { bg: "bg-red-100 border-red-300 border-l-4 border-l-red-600", text: "text-red-800", icon: "⚠️" };
    }
    if (result.overallScore < 60) {
      return { bg: "bg-gray-100 border-gray-300 border-l-4 border-l-gray-500", text: "text-gray-800", icon: "❓" };
    }
    if (result.overallScore < 75) {
      return { bg: "bg-yellow-50 border-yellow-300 border-l-4 border-l-yellow-500", text: "text-yellow-800", icon: "⚠️" };
    }
    return result.isReal
      ? { bg: "bg-green-50 border-green-200 border-l-4 border-l-green-600", text: "text-green-800", icon: "✅" }
      : { bg: "bg-red-50 border-red-200 border-l-4 border-l-red-600", text: "text-red-800", icon: "❌" };
  };

  const styles = getStyles();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12 border-b border-black pb-8 dark:border-white">
        <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-tight mb-4 leading-none">
          Verify News
        </h1>
        <p className="text-xl text-neutral-500 max-w-2xl font-bold uppercase tracking-widest">
          Paste a headline or article text to check its authenticity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider mb-2">News Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter article title..."
                className="w-full p-4 border border-black dark:border-neutral-700 bg-transparent focus:ring-2 focus:ring-black dark:focus:ring-white transition outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider mb-2">News Content</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the full article text here..."
                rows={8}
                className="w-full p-4 border border-black dark:border-neutral-700 bg-transparent focus:ring-2 focus:ring-black dark:focus:ring-white transition outline-none resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'verifying'}
              className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50"
            >
              Verify Article
            </button>
          </form>
        </div>

        <div>
          <div className="p-8 border min-h-75 border-black dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 flex flex-col justify-center">
            {status === 'idle' && (
              <div className="text-center text-neutral-500">
                <AlertCircle className="mx-auto mb-4 w-12 h-12 opacity-20" />
                <p className="font-bold uppercase tracking-wider text-sm">Enter content to begin verification</p>
              </div>
            )}

            {status === 'verifying' && (
              <div className="text-center text-black dark:text-white">
                <Loader2 className="animate-spin w-12 h-12 mx-auto mb-4" />
                <p className="font-bold uppercase tracking-wider text-sm">Analyzing via TruthX AI...</p>
              </div>
            )}

            {status === 'needs_auth' && (
              <div className="text-center text-red-500">
                <AlertCircle className="mx-auto w-12 h-12 mb-4" />
                <p className="font-bold uppercase tracking-wider text-sm">You must be logged in to verify.</p>
              </div>
            )}

            {status === 'needs_key' && (
              <div className="text-center text-red-500">
                <AlertCircle className="mx-auto w-12 h-12 mb-4" />
                <p className="font-bold uppercase tracking-wider text-sm">No API Key configured.</p>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center text-red-500">
                <AlertCircle className="mx-auto w-12 h-12 mb-4" />
                <p className="font-bold uppercase tracking-wider text-sm mb-2">Verification Failed</p>
                <p className="text-sm">{result?.error}</p>
              </div>
            )}

            {status === 'result' && result && (
              <div className={`p-6 border min-h-full flex gap-4 ${styles.bg}`}>
                <div className="text-4xl mt-1">{styles.icon}</div>
                <div className="w-full">
                  <h4 className={`font-bold text-2xl mb-4 ${styles.text}`}>
                    {result.label}
                  </h4>
                  <div className="text-sm space-y-2 font-bold tracking-wide">
                    <div className="flex justify-between"><span>🧠 AI Confidence</span> <span>{result.aiConfidence}%</span></div>
                    <div className="flex justify-between"><span>🌐 External Sources</span> <span>{result.externalScore ?? "N/A"}%</span></div>
                    <div className="flex justify-between pt-2 border-t border-black/10"><span>⚖️ Overall Verdict</span> <span>{result.overallScore}%</span></div>
                  </div>
                  <div className="w-full bg-black/10 h-2 rounded mt-4 overflow-hidden">
                    <div className="h-2 rounded bg-current transition-all duration-1000" style={{ width: `${result.overallScore}%` }} />
                  </div>
                  <p className="text-sm mt-6 font-medium leading-relaxed opacity-90">{result.reasoning}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
