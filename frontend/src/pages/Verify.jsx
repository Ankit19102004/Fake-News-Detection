import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Loader2 } from 'lucide-react';
import { mockVerify } from '../utils/mockVerify';

const PieChart = ({ value, isReal, conflict, trigger }) => {
  const [progress, setProgress] = React.useState(0);

  const radius = 45;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;

  React.useEffect(() => {
    if (!trigger) return;

    let start = 0;
    const duration = 1000;
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = value / steps;

    const interval = setInterval(() => {
      start += increment;

      if (start >= value) {
        start = value;
        clearInterval(interval);
      }

      setProgress(Math.round(start));
    }, stepTime);

    return () => clearInterval(interval);
  }, [trigger, value]);

  return (
    <div className="relative w-30 h-30 flex items-center justify-center drop-shadow-sm">
      <svg className="-rotate-90" height="120" width="120">
        <circle
          stroke="currentColor"
          className="text-black/10 dark:text-white/10 transition-colors duration-300"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx="60"
          cy="60"
        />
        <circle
          stroke="currentColor"
          className={`transition-colors duration-300 ${conflict
            ? "text-rose-500"
            : progress < 60
              ? "text-neutral-400"
              : progress < 75
                ? "text-amber-500"
                : isReal
                  ? "text-emerald-500"
                  : "text-rose-500"
            }`}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{
            strokeDashoffset:
              circumference - (progress / 100) * circumference,
            transition: "stroke-dashoffset 0.1s linear",
          }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx="60"
          cy="60"
        />
      </svg>

      <div className="absolute text-xl font-bold tracking-tighter text-black/80 dark:text-white/90">
        {progress}%
      </div>
    </div>
  );
};

export const Verify = () => {
  const { isAuthenticated, apiKey } = useAuth();

  const [title, setTitle] = useState('');
  const [text, setText] = useState('');

  const [status, setStatus] = useState('idle'); // idle, verifying, result, error, needs_auth
  const [result, setResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [animatePie, setAnimatePie] = useState(false);

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
    setAnimatePie(false);
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
        setAnimatePie(true);
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
      return {
        bg: "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 border-l-4 border-l-rose-500",
        text: "text-rose-800 dark:text-rose-400",
        border: "border-rose-200 dark:border-rose-900/50",
        divide: "divide-rose-200 dark:divide-rose-900/50"
      };
    }

    if (result.overallScore < 60) {
      return {
        bg: "bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700/50 border-l-4 border-l-neutral-400",
        text: "text-neutral-800 dark:text-neutral-300",
        border: "border-neutral-200 dark:border-neutral-700/50",
        divide: "divide-neutral-200 dark:divide-neutral-700/50"
      };
    }

    if (result.overallScore < 75) {
      return {
        bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 border-l-4 border-l-amber-500",
        text: "text-amber-800 dark:text-amber-400",
        border: "border-amber-200 dark:border-amber-900/50",
        divide: "divide-amber-200 dark:divide-amber-900/50"
      };
    }

    return result.isReal
      ? {
        bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 border-l-4 border-l-emerald-500",
        text: "text-emerald-800 dark:text-emerald-400",
        border: "border-emerald-200 dark:border-emerald-900/50",
        divide: "divide-emerald-200 dark:divide-emerald-900/50"
      }
      : {
        bg: "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 border-l-4 border-l-rose-500",
        text: "text-rose-800 dark:text-rose-400",
        border: "border-rose-200 dark:border-rose-900/50",
        divide: "divide-rose-200 dark:divide-rose-900/50"
      };
  };

  const styles = getStyles();

  return (
    <div className="max-w-[75%] mx-auto px-4 py-12">
      <div className="mb-12 border-b border-black pb-8 dark:border-white">
        <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-tight mb-4 leading-none">
          Verify News
        </h1>
        <p className="text-xl text-neutral-500 max-w-2xl font-bold uppercase tracking-widest">
          Paste a headline or article text to check its authenticity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
        <div className="flex flex-col h-full">
          <form onSubmit={handleVerify} className="flex flex-col h-full">
            <div className="space-y-6 flex-1">
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
                  rows={12}
                  className="w-full p-4 border border-black dark:border-neutral-700 bg-transparent focus:ring-2 focus:ring-black dark:focus:ring-white transition outline-none resize-none"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={status === 'verifying'}
              className="w-full h-14 mt-6 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50 shrink-0"
            >
              Verify Article
            </button>
          </form>
        </div>

        <div className="flex flex-col h-full">
          <label className="block text-sm font-bold uppercase tracking-wider mb-1.5">Result</label>
          <div className={`w-full p-8 border border-black dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 flex flex-col justify-center transition-all duration-300 ${status === 'result' ? 'h-full' : 'h-[calc(100%-80px)]'}`}>
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
              <div className={`p-6 sm:p-8 h-[50vh] rounded border shadow-lg transition-all duration-500 ease-in-out transform ${styles.bg}`}>

                {/* 🔹 TOP SECTION */}
                <div className="flex flex-col-reverse sm:flex-row gap-8 items-start sm:items-center">

                  {/* LEFT TEXT */}
                  <div className="flex-1 space-y-3 w-full">
                    <h4 className={`text-2xl sm:text-3xl font-bold tracking-tight ${styles.text}`}>
                      {result.label}
                    </h4>

                    <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">
                      {result.reasoning}
                    </p>
                  </div>

                  {/* RIGHT PIE */}
                  <div className="flex items-center justify-center shrink-0 w-full sm:w-auto">
                    <PieChart
                      value={result.overallScore}
                      isReal={result.isReal}
                      conflict={result.conflict}
                      trigger={animatePie}
                    />
                  </div>
                </div>

                <hr className={`my-6 border-t ${styles.border}`} />

                {/* 🔻 TOGGLE BUTTON */}
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className={`flex items-center justify-between w-full text-sm font-medium transition-opacity hover:opacity-80 ${styles.text}`}
                >
                  <span className="hover:underline underline-offset-4 decoration-current/50">
                    {showDetails ? "Hide detailed analysis" : "View detailed analysis"}
                  </span>
                  <span className="text-2xl leading-none font-light">
                    {showDetails ? "−" : "+"}
                  </span>
                </button>

                {/* 🔻 DETAILS (TOGGLED) */}
                <div
                  className={`transition-all duration-500 ease-in-out overflow-hidden ${showDetails ? "max-h-60 opacity-100 mt-6" : "max-h-0 opacity-0"
                    }`}
                >
                  <div className={`grid grid-cols-3 gap-4 pt-2 pb-4 text-center divide-x ${styles.divide}`}>

                    {/* Model */}
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <span className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                        Model
                      </span>
                      <span className="text-2xl font-semibold tabular-nums tracking-tight text-neutral-800 dark:text-neutral-200">
                        {result.aiConfidence}%
                      </span>
                    </div>

                    {/* Sources */}
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <span className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                        Sources
                      </span>
                      <span className="text-2xl font-semibold tabular-nums tracking-tight text-neutral-800 dark:text-neutral-200">
                        {result.externalScore ?? "N/A"}{result.externalScore !== null ? '%' : ''}
                      </span>
                    </div>

                    {/* Verdict */}
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <span className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                        Verdict
                      </span>
                      <span className={`text-2xl font-bold tabular-nums tracking-tight ${styles.text}`}>
                        {result.overallScore}%
                      </span>
                    </div>

                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
