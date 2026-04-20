import React, { useState, useEffect } from 'react';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockVerify } from '../utils/mockVerify';
import { NewsCard } from '../components/NewsCard';
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react';



export const Article = () => {
  const { state } = useLocation();
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  const { isAuthenticated, apiKey } = useAuth();

  const article = state?.article;

  const [scanStatus, setScanStatus] = useState('idle'); // idle, scanning, result, error
  const [result, setResult] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);

  const [fullArticleData, setFullArticleData] = useState(null);
  const [isFetchingFull, setIsFetchingFull] = useState(false);

  const [showDetails, setShowDetails] = useState(false);

  const API_KEY = import.meta.env.VITE_NEWS_API_KEY;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setScanStatus('idle');
    setResult(null);
    setFullArticleData(null);
  }, [article]);

  useEffect(() => {
    if (!article) return;

    const fetchFullArticle = async () => {
      setIsFetchingFull(true);
      try {
        const response = await fetch("http://localhost:5000/fetch_article", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: article.title,
            description: article.description,
            url: article.url
          }),
        });
        const data = await response.json();
        if (data.full_content) {
          setFullArticleData(data);
        }
      } catch (err) {
        console.error("Failed to fetch full article", err);
      } finally {
        setIsFetchingFull(false);
      }
    };

    fetchFullArticle();

    const fetchRelated = async () => {
      try {
        const query = article.category || "technology";
        // Default to something to avoid empty query issues
        const searchQuery = query === "General" ? "world news" : query;
        const res = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(searchQuery)}&sortBy=relevancy&pageSize=10&apiKey=${API_KEY}`);
        const data = await res.json();

        if (data.status === "ok" && data.articles) {
          const formatted = data.articles
            .filter(a => a.title && a.title !== article.title && a.description && a.urlToImage)
            .slice(0, 4)
            .map((item, i) => ({
              id: `related-${i}`,
              title: item.title,
              category: typeof item.source === 'object' ? item.source.name : item.source || "General",
              date: new Date(item.publishedAt).toDateString(),
              description: item.description,
              image: item.urlToImage
            }));

          setRelatedArticles(formatted);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchRelated();
  }, [article, API_KEY]);

  if (!article) {
    return <Navigate to="/" replace />;
  }

  const handleVerify = async () => {
    if (!isAuthenticated) {
      alert("Must be logged in to verify.");
      return;
    }
    if (!apiKey) {
      alert("TruthX API Key missing in settings.");
      return;
    }

    setScanStatus('scanning');
    setResult(null);
    setShowDetails(false);

    // Wait for the CSS scanner animation completion
    await new Promise(resolve => setTimeout(resolve, 2500));

    try {
      const res = await mockVerify(article.title, article.description || "", apiKey);
      if (res.verdict === "ERROR") {
        setScanStatus('error');
        return;
      }

      const aiConfidence = Math.round(res.confidence * 100);
      const externalScore = res.external_score !== undefined ? Math.round(res.external_score * 100) : null;
      const overallScore = res.final_score !== undefined
        ? Math.round(res.final_score * 100)
        : externalScore !== null
          ? Math.round((aiConfidence * 0.65) + (externalScore * 0.35))
          : aiConfidence;

      const isReal = res.original_prediction === "Real News";
      const conflict = res.conflict_detected || false;

      let label = "";
      if (conflict) label = "Conflicting Evidence";
      else if (overallScore >= 75) label = isReal ? "Verified Real" : "Verified Fake";
      else if (overallScore >= 60) label = isReal ? "Likely Real" : "Likely Fake";
      else label = isReal ? "Uncertain (Leaning Real)" : "Uncertain (Leaning Fake)";

      let reasoning = "";
      if (conflict) reasoning = "AI predictions and external sources provide conflicting signals.";
      else if (overallScore >= 75) reasoning = isReal ? "Strong agreement across AI models and external sources." : "Strong indicators suggest this content is misleading.";
      else if (overallScore >= 60) reasoning = isReal ? "Moderate confidence. Most signals suggest this is reliable." : "Moderate confidence. Some signals suggest this may be misleading.";
      else reasoning = "Low confidence. Mixed signals detected.";

      setResult({ aiConfidence, externalScore, overallScore, label, reasoning, conflict, isReal });
      setScanStatus('result');
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setScanStatus('error');
    }
  };

  const getStyles = () => {
    if (!result) return {};
    if (result.conflict) return { bg: "bg-rose-50 border-rose-200 border-l-4 border-l-rose-500", text: "text-rose-800", bar: "bg-rose-500", border: "border-rose-200", divide: "divide-rose-200" };
    if (result.overallScore < 60) return { bg: "bg-neutral-50 border-neutral-200 border-l-4 border-l-neutral-400", text: "text-neutral-800", bar: "bg-neutral-400", border: "border-neutral-200", divide: "divide-neutral-200" };
    if (result.overallScore < 75) return { bg: "bg-amber-50 border-amber-200 border-l-4 border-l-amber-500", text: "text-amber-800", bar: "bg-amber-500", border: "border-amber-200", divide: "divide-amber-200" };
    return result.isReal
      ? { bg: "bg-emerald-50 border-emerald-200 border-l-4 border-l-emerald-500", text: "text-emerald-800", bar: "bg-emerald-500", border: "border-emerald-200", divide: "divide-emerald-200" }
      : { bg: "bg-rose-50 border-rose-200 border-l-4 border-l-rose-500", text: "text-rose-800", bar: "bg-rose-500", border: "border-rose-200", divide: "divide-rose-200" };
  };

  const styles = getStyles();

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">

      {/* HEADER SECTION */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <span className="text-sm font-bold uppercase tracking-widest bg-black text-white px-3 py-1">
            {article.category}
          </span>
          <span className="text-sm font-bold text-neutral-500 uppercase tracking-widest">
            {article.date}
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold font-serif tracking-tight leading-tight mb-8">
          {article.title}
        </h1>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-y border-neutral-200 dark:border-neutral-800 py-4 mb-10">
          <p className="text-neutral-500 text-sm font-medium uppercase tracking-widest">
            TruthX Analysis Available
          </p>
          <button
            onClick={handleVerify}
            disabled={scanStatus === 'scanning'}
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide bg-black text-white px-8 py-3 hover:bg-neutral-800 transition-colors disabled:opacity-50 shrink-0"
          >
            {scanStatus === 'scanning' ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
            {scanStatus === 'scanning' ? 'Scanning...' : 'Verify News'}
          </button>
        </div>
      </div>

      {/* RESULT SECTION (INLINE) */}
      {scanStatus === 'error' && (
        <div className="mb-10 p-6 border border-red-200 bg-red-50 text-red-800 flex items-center gap-4">
          <AlertCircle />
          <p className="font-medium tracking-wide">Failed to verify the article. Please try again.</p>
        </div>
      )}

      {scanStatus === 'result' && result && (
        <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className={`p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 ${styles.bg} border-l-4 rounded-r-xl shadow-sm`}>

            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <ShieldCheck className={styles.text} size={28} />
                <h4 className={`text-2xl font-bold tracking-tight uppercase ${styles.text}`}>
                  {result.label}
                </h4>
              </div>
              <p className="text-base text-neutral-700 leading-relaxed font-serif max-w-2xl">
                {result.reasoning}
              </p>
            </div>

            <div className="shrink-0 flex flex-col gap-4 w-full md:w-64 pt-4 md:pt-0 border-t border-black/10 dark:border-white/10 md:border-t-0 md:border-l md:pl-6">
              <div className="w-full">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2 text-neutral-500">
                  <span>VERDICT</span>
                  <span className={styles.text}>{result.overallScore}%</span>
                </div>
                <div className="w-full h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ease-out ${styles.bar}`}
                    style={{ width: `${result.overallScore}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-[10px] uppercase font-bold text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 mt-2 self-start md:self-end decoration-2 underline-offset-4 hover:underline transition-colors"
              >
                {showDetails ? "Hide breakdown −" : "Show breakdown +"}
              </button>

              {showDetails && (
                <div className="flex gap-2 w-full mt-1 animate-in slide-in-from-top-2 fade-in duration-300">
                  <div className="flex-1 bg-white/60 dark:bg-black/10 px-3 py-2 rounded-md text-center shadow-sm">
                    <span className="block text-[10px] uppercase font-bold text-neutral-400">MODELS</span>
                    <span className={`block text-lg font-bold ${styles.text}`}>{result.aiConfidence}%</span>
                  </div>
                  <div className="flex-1 bg-white/60 dark:bg-black/10 px-3 py-2 rounded-md text-center shadow-sm">
                    <span className="block text-[10px] uppercase font-bold text-neutral-400">Sources</span>
                    <span className={`block text-lg font-bold ${styles.text}`}>{result.externalScore ?? "N/A"}{result.externalScore !== null ? '%' : ''}</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ARTICLE CONTENT */}
      <article className="relative mb-20 overflow-hidden">

        {/* Scanner overlay */}
        {scanStatus === 'scanning' && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            {/* Dim background slightly over the text area */}
            <div className="absolute inset-0 bg-black/5 dark:bg-white/5 mix-blend-multiply transition-opacity duration-300" />
            {/* Animated scanning bar */}
            <div
              className="absolute left-0 right-0 h-1 bg-emerald-500 shadow-[0_0_30px_10px_rgba(16,185,129,0.3)] z-20"
              style={{ animation: 'scanner 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards' }}
            />
            <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-black text-emerald-400 font-mono text-[10px] sm:text-xs px-4 py-2 font-bold tracking-widest uppercase flex items-center gap-3 rounded-full shadow-2xl animate-pulse">
              <Loader2 className="animate-spin" size={16} /> TruthX Scanning...
            </div>
          </div>
        )}

        <div className={`transition-opacity duration-500 ${scanStatus === 'scanning' ? 'opacity-90' : 'opacity-100'}`}>
          <img
            src={article.image}
            alt={article.title}
            className="w-full aspect-21/9 object-cover bg-neutral-100 mb-12"
          />

          <div className="max-w-4xl mx-auto space-y-8 text-neutral-800 dark:text-neutral-300 text-lg sm:text-xl leading-relaxed font-serif text-justify">
            {/* Lead paragraph bold */}
            <p className="font-bold text-xl sm:text-2xl leading-snug">
              {fullArticleData?.summary || article.description}
            </p>

            {/* Actual content */}
            {isFetchingFull ? (
              <div className="flex items-center gap-3 py-10 justify-center">
                <Loader2 className="animate-spin text-neutral-400" size={24} />
                <span className="text-neutral-500 font-sans text-sm tracking-widest uppercase">Fetching full article sources...</span>
              </div>
            ) : fullArticleData?.full_content ? (
              <>
                {fullArticleData.full_content.split('\n\n').map((par, idx) => (
                  <p key={idx}>{par}</p>
                ))}

                <div className="mt-8 border-t border-black/10 dark:border-white/10 pt-4 flex gap-4 text-xs font-sans text-neutral-500 uppercase tracking-widest">
                  <span>Data Confidence: {fullArticleData.confidence}</span>
                  <span>Sources: {fullArticleData.sources_used.join(', ')}</span>
                </div>
              </>
            ) : (
              article.content && article.content !== article.description && (
                <p>
                  {article.content.split('[+')[0]} {/* Clean up NewsAPI truncation tag */}
                </p>
              )
            )}

            {/* Link to Read Full Source */}
            {article.url && (
              <div className="pt-8">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-base font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors hover:underline underline-offset-4 decoration-2"
                >
                  Read full original article on source website →
                </a>
              </div>
            )}
          </div>
        </div>
      </article>

      {/* RELATED NEWS */}
      {relatedArticles.length > 0 && (
        <div className="border-t border-black dark:border-white pt-12">
          <h3 className="text-3xl font-bold font-serif mb-8">Related Stories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {relatedArticles.map(rel => (
              <NewsCard
                key={rel.id}
                article={rel}
                hideVerify={true}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
