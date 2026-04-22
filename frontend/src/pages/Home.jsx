import React, { useState, useEffect } from 'react';
import { NewsCard } from '../components/NewsCard';
import { VerificationModal } from '../components/VerificationModal';

const MOCK_NEWS = [
  {
    id: 1,
    title: "Global Markets Rally as Tech Giants Post Record Ecosystem Growth",
    category: "Economy",
    date: "Aug 25 • 2026",
    description: "In an unexpected turn...",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f"
  },
  {
    id: 2,
    title: "Australia wins 2023 ICC Cricket World Cup final against India",
    category: "Sport",
    date: "Nov 19 • 2023",
    description: "Australia won the 2023 ICC Men’s Cricket World Cup...",
    image: "https://www.reuters.com/resizer/v2/BNBV7GTOSRIOFAZIFBFKTWQM44.jpg?auth=99c5cbe885c196b142d4bb3be2fa0b78d4fda5ab30e37bb7912bf6c7afb70a79"
  }
];

const CURRENT_YEAR = new Date().getFullYear();
const EXPLORE_START_YEAR = 2020;
const EXPLORE_YEARS = Array.from(
  { length: CURRENT_YEAR - EXPLORE_START_YEAR + 1 },
  (_, index) => CURRENT_YEAR - index
);

const getFallbackNews = (category) => {
  const normalizedCategory = category?.toLowerCase() || 'technology';

  if (normalizedCategory === 'about' || normalizedCategory === 'contact') {
    return MOCK_NEWS;
  }

  if (normalizedCategory === 'explore') {
    return [];
  }

  return MOCK_NEWS.filter(
    (news) => news.category.toLowerCase() === normalizedCategory
  );
};

export const Home = ({ category = "about" }) => {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articles, setArticles] = useState(MOCK_NEWS); // default mock
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [exploreMessage, setExploreMessage] = useState('');

  const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
  const API_URL = import.meta.env.VITE_API_URL;
  const API_BASE_URL = (API_URL || 'http://localhost:5000').replace(/\/$/, '');
  const normalizedCategory = category?.toLowerCase() || 'technology';
  const isExplore = normalizedCategory === 'explore';

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setExploreMessage('');
      try {
        console.log("Fetching news...");
        console.log("API KEY:", API_KEY);

        if (isExplore) {
          const res = await fetch(
            `${API_BASE_URL}/explore_news?year=${selectedYear}&limit=18`
          );
          const contentType = res.headers.get('content-type') || '';

          if (!contentType.includes('application/json')) {
            const responsePreview = (await res.text()).slice(0, 120);
            throw new Error(
              `Explore API returned ${contentType || 'a non-JSON response'} instead of JSON. Check VITE_API_URL or backend server. ${responsePreview}`
            );
          }

          const data = await res.json();
          console.log("EXPLORE API RESPONSE:", data);

          if (!res.ok || data.status === "error") {
            throw new Error(data.message || "Unable to fetch archived explore news.");
          }

          const formatted = (data.articles || []).map((item, index) => ({
            ...item,
            id: item.id || `explore-${selectedYear}-${index}`
          }));

          if (formatted.length > 0) {
            setExploreMessage(data.message || '');
            setArticles(formatted);
          } else {
            setExploreMessage(`No archived articles were found for ${selectedYear}.`);
            setArticles([]);
          }

          return;
        }

        let query = "technology";

        switch (normalizedCategory) {
          case "science": query = "science OR research"; break;
          case "economy": query = "economy OR finance"; break;
          case "business": query = "business OR startup"; break;
          case "about": query = "technology"; break;
          case "contact": query = "world news"; break;
          default: query = category || "technology"; break;
        }

        const requestUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=9&language=en&apiKey=${API_KEY}`;

        const res = await fetch(requestUrl);
        const data = await res.json();
        console.log("API RESPONSE:", data);

        if (!res.ok || data.status === "error") {
          throw new Error(data.message || "Unable to fetch news right now.");
        }

        if (data.status === "ok" && data.articles?.length > 0) {
          const formatted = data.articles
            .filter(a => a.title && a.title !== "[Removed]" && a.description && a.urlToImage)
            .map((item, index) => ({
              id: index,
              title: item.title,
              category: typeof item.source === 'object' ? item.source.name : item.source || "General",
              date: new Date(item.publishedAt).toDateString(),
              description: item.description || "No description available",
              image: item.urlToImage || "https://via.placeholder.com/400",
              content: item.content || "",
              url: item.url || ""
            }));

          const fallbackNews = getFallbackNews(category);

          if (formatted.length > 0) {
            setArticles(formatted);
          } else {
            if (isExplore) {
              setExploreMessage(`No live articles were returned for ${selectedYear}.`);
            }
            setArticles(isExplore ? [] : (fallbackNews.length > 0 ? fallbackNews : MOCK_NEWS));
          }
        } else {
          const fallbackNews = getFallbackNews(category);
          if (isExplore) {
            setExploreMessage(`No live articles were returned for ${selectedYear}.`);
          }
          setArticles(isExplore ? [] : (fallbackNews.length > 0 ? fallbackNews : MOCK_NEWS));
        }
      } catch (err) {
        console.error("API ERROR:", err);
        const fallbackNews = getFallbackNews(category);
        if (isExplore) {
          setExploreMessage(err.message || 'Unable to fetch archived explore news.');
        }
        setArticles(isExplore ? [] : (fallbackNews.length > 0 ? fallbackNews : MOCK_NEWS));
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [category, API_BASE_URL, API_KEY, isExplore, normalizedCategory, selectedYear]);

  const handleVerify = (article) => {
    setSelectedArticle(article);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">

      {/* Header */}
      <div className="mb-16 border-b border-black pb-8 dark:border-white">
        <h1 className="text-4xl md:text-7xl font-bold font-serif tracking-tight mb-4 leading-none text-neutral-900 dark:text-neutral-50">
          Truth Beyond the Surface
        </h1>
        <p className="text-xl text-neutral-500 dark:text-neutral-400 max-w-2xl font-bold uppercase tracking-widest">
          Curated insights, bold stories, and verified facts.
        </p>

        {isExplore && (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold font-serif text-neutral-900 dark:text-neutral-50">Explore News</h2>
              <p className="text-sm uppercase tracking-[0.2em] text-neutral-500 mt-2">
                Browse major stories year by year
              </p>
            </div>

            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
              Filter by Year

              <div className="relative w-44">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full appearance-none border border-neutral-300 bg-white px-4 py-3 pr-10 text-sm font-semibold text-neutral-900 shadow-sm transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-white dark:focus:ring-white/10"
                >
                  {EXPLORE_YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>

                {/* Custom Arrow */}
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-neutral-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </label>
          </div>
        )}

        {isExplore && (
          <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
            Explore loads archived headlines year-wise from the backend archive feed.
          </p>
        )}
      </div>

      {/* Loader */}
      {loading && (
        <p className="text-center text-lg">
          {isExplore ? `Fetching top stories from ${selectedYear}...` : 'Fetching latest news...'}
        </p>
      )}

      {/* News Grid */}
      {!loading && articles.length === 0 ? (
        <div className="border border-dashed border-neutral-300 px-6 py-12 text-center dark:border-neutral-700">
          <p className="text-lg font-semibold">
            No news found for {isExplore ? selectedYear : category}.
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            {exploreMessage || 'Try another year in Explore or switch to a different category.'}
          </p>
        </div>
      ) : (
        <>
          {isExplore && exploreMessage && (
            <div className="mb-6 border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {exploreMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-16">
            {articles.map(article => (
              <NewsCard
                key={article.id}
                article={article}
                onVerify={handleVerify}
              />
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      {selectedArticle && (
        <VerificationModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  );
};
