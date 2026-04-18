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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
        bg: "bg-red-100 border-red-300 border-l-4 border-l-red-600",
        text: "text-red-800",
        icon: "⚠️"
      };
    }

    if (result.overallScore < 60) {
      return {
        bg: "bg-gray-100 border-gray-300 border-l-4 border-l-gray-500",
        text: "text-gray-800",
        icon: "❓"
      };
    }

    if (result.overallScore < 75) {
      return {
        bg: "bg-yellow-50 border-yellow-300 border-l-4 border-l-yellow-500",
        text: "text-yellow-800",
        icon: "⚠️"
      };
    }

    return result.isReal
      ? {
        bg: "bg-green-50 border-green-200 border-l-4 border-l-green-600",
        text: "text-green-800",
        icon: "✅"
      }
      : {
        bg: "bg-red-50 border-red-200 border-l-4 border-l-red-600",
        text: "text-red-800",
        icon: "❌"
      };
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
              <div className={`p-6 border flex gap-4 mb-4 ${styles.bg}`}>
                <div className="text-2xl">{styles.icon}</div>

                <div className="w-full">
                  <h4 className={`font-bold text-lg ${styles.text}`}>
                    {result.label}
                  </h4>

                  <div className="text-sm mt-2 space-y-1">
                    <div>🧠 AI: {result.aiConfidence}%</div>
                    <div>🌐 External: {result.externalScore ?? "N/A"}%</div>
                    <div>⚖️ Final: {result.overallScore}%</div>
                  </div>

                  <div className="w-full bg-gray-200 h-2 rounded mt-3">
                    <div
                      className="h-2 rounded bg-black"
                      style={{ width: `${result.overallScore}%` }}
                    />
                  </div>

                  <p className="text-sm mt-3">{result.reasoning}</p>
                </div>
              </div>

              <button onClick={onClose} className="w-full bg-black text-white py-3">
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