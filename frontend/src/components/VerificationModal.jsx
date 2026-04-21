import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockVerify } from '../utils/mockVerify';

export const VerificationModal = ({ article, onClose }) => {
  const { isAuthenticated, apiKey } = useAuth();

  const [status, setStatus] = useState('checking_prereqs');
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

    if (hasFetched.current) return;
    hasFetched.current = true;

    setStatus('verifying');

    const verifyArticle = async () => {
      try {
        const res = await mockVerify(article.title, article.description || "", apiKey);

        if (res.verdict === "ERROR") {
          setStatus('error');
          setResult({ error: res.error });
        } else {

          // ✅ Convert here only
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

          // ✅ OPTION 1 LABEL SYSTEM
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

          // ✅ MATCHING REASONING
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

    verifyArticle();
  }, [isAuthenticated, apiKey, article]);

  // 🎨 UI STYLES
  const getStyles = () => {
    if (!result) return {};

    if (result.conflict) {
      return {
        bg: "bg-rose-50 border-rose-200 border-l-4 border-l-rose-500",
        text: "text-rose-800",
        border: "border-rose-200",
        divide: "divide-rose-200"
      };
    }

    if (result.overallScore < 60) {
      return {
        bg: "bg-neutral-50 border-neutral-200 border-l-4 border-l-neutral-400",
        text: "text-neutral-800",
        border: "border-neutral-200",
        divide: "divide-neutral-200"
      };
    }

    if (result.overallScore < 75) {
      return {
        bg: "bg-amber-50 border-amber-200 border-l-4 border-l-amber-500",
        text: "text-amber-800",
        border: "border-amber-200",
        divide: "divide-amber-200"
      };
    }

    return result.isReal
      ? {
        bg: "bg-emerald-50 border-emerald-200 border-l-4 border-l-emerald-500",
        text: "text-emerald-800",
        border: "border-emerald-200",
        divide: "divide-emerald-200"
      }
      : {
        bg: "bg-rose-50 border-rose-200 border-l-4 border-l-rose-500",
        text: "text-rose-800",
        border: "border-rose-200",
        divide: "divide-rose-200"
      };
  };

  const PieChart = ({ value, isReal, conflict, trigger }) => {
    const [progress, setProgress] = React.useState(0);

    const radius = 45;
    const stroke = 8;
    const normalizedRadius = radius - stroke * 0.5;
    const circumference = normalizedRadius * 2 * Math.PI;

    // 🎯 Animate from 0 → value
    React.useEffect(() => {
      if (!trigger) return;

      let start = 0;
      const duration = 1000; // total animation time (1s)
      const stepTime = 16; // ~60fps
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

    const strokeDashoffset =
      circumference - (progress / 100) * circumference;

    return (
      <div className="relative w-30 h-30 flex items-center justify-center drop-shadow-sm">

        {/* Rotated SVG */}
        <svg className="-rotate-90" height="120" width="120">
          <circle
            stroke="currentColor"
            className="text-black/10 transition-colors duration-300"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx="60"
            cy="60"
          />

          <circle
            stroke="currentColor"
            className={`transition-colors duration-300 ${
              conflict
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
              strokeDashoffset,
              transition: "stroke-dashoffset 0.1s linear",
            }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx="60"
            cy="60"
          />
        </svg>

        {/* Animated % */}
        <div className="absolute text-xl font-bold tracking-tighter text-black/80">
          {progress}%
        </div>
      </div>
    );
  };

  const ResultOption1 = ({ result, styles }) => {
    const [open, setOpen] = useState(false);

    return (
      <div className={`p-6 border shadow-sm transition-all duration-300 ease-in-out ${styles.bg}`}>

        {/* 🔹 TOP SECTION */}
        <div className="flex gap-6 items-center">
          <div className="flex-1 space-y-2 w-full">
            <h4 className={`text-xl font-bold tracking-tight ${styles.text}`}>
              {result.label}
            </h4>
            <p className="text-sm text-neutral-700 leading-relaxed font-medium">
              {result.reasoning}
            </p>
          </div>

          {/* RIGHT PIE */}
          <div className="shrink-0 flex items-center justify-center">
            <PieChart
              value={result.overallScore}
              isReal={result.isReal}
              conflict={result.conflict}
              trigger={status === "result"}
            />
          </div>
        </div>

        <hr className={`my-5 border-t ${styles.border}`} />

        {/* 🔻 TOGGLE BUTTON */}
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center justify-between w-full text-sm font-medium transition-opacity hover:opacity-80 ${styles.text}`}
        >
          <span className="hover:underline underline-offset-4 decoration-current/50">
            {open ? "Hide detailed analysis" : "View detailed analysis"}
          </span>
          <span className="text-2xl leading-none font-light">
            {open ? "−" : "+"}
          </span>
        </button>

        {/* 🔻 DETAILS (TOGGLED) */}
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${open ? "max-h-60 opacity-100 mt-5" : "max-h-0 opacity-0"
            }`}
        >
          <div className={`grid grid-cols-3 gap-2 pt-2 pb-2 text-center divide-x ${styles.divide}`}>

            {/* Model */}
            <div className="flex flex-col items-center justify-center space-y-1">
              <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-neutral-500">
                Model
              </span>
              <span className="text-xl sm:text-2xl font-semibold tabular-nums tracking-tight text-neutral-800">
                {result.aiConfidence}%
              </span>
            </div>

            {/* Sources */}
            <div className="flex flex-col items-center justify-center space-y-1">
              <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-neutral-500">
                Sources
              </span>
              <span className="text-xl sm:text-2xl font-semibold tabular-nums tracking-tight text-neutral-800">
                {result.externalScore ?? "N/A"}{result.externalScore !== null ? '%' : ''}
              </span>
            </div>

            {/* Verdict */}
            <div className="flex flex-col items-center justify-center space-y-1">
              <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-neutral-500">
                Verdict
              </span>
              <span className={`text-xl sm:text-2xl font-bold tabular-nums tracking-tight ${styles.text}`}>
                {result.overallScore}%
              </span>
            </div>

          </div>
        </div>

      </div>
    );
  };

  const styles = getStyles();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 z-50">
      <div className="bg-white border w-full max-w-lg shadow-2xl">

        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-bold text-sm uppercase">TruthX Verification</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="p-6">

          {/* Article */}
          <div className="mb-6 p-4 border-l-4 border-l-black bg-neutral-50">
            <h4 className="font-bold">{article.title}</h4>
            <p className="text-xs text-neutral-500">
              {article.category} • {article.date}
            </p>
          </div>

          {/* RESULT */}
          {status === 'result' && result && (
            <>
              <ResultOption1 result={result} styles={styles} />
              <button onClick={onClose} className="w-full bg-black text-white py-3 mt-4">
                Done
              </button>
            </>
          )}

          {status === 'verifying' && (
            <div className="text-center py-10">
              <Loader2 className="animate-spin mx-auto mb-2" />
              <p>Analyzing...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center text-red-500">
              <AlertCircle className="mx-auto mb-2" />
              <p>{result?.error}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};