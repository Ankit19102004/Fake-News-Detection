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

export const Home = ({ category = "about" }) => {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articles, setArticles] = useState(MOCK_NEWS); // default mock
  const [loading, setLoading] = useState(true);

  const API_KEY = import.meta.env.VITE_NEWS_API_KEY;

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        console.log("Fetching news...");
        console.log("API KEY:", API_KEY);

        let query = "technology";
        switch (category?.toLowerCase()) {
          case "science": query = "science OR research"; break;
          case "economy": query = "economy OR finance"; break;
          case "business": query = "business OR startup"; break;
          case "about": query = "technology"; break;
          case "contact": query = "world news"; break;
          default: query = category || "technology"; break;
        }
        
        const res = await fetch(
          `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=9&apiKey=${API_KEY}`
        );

        const data = await res.json();
        console.log("API RESPONSE:", data);

        if (data.status === "ok" && data.articles?.length > 0) {
          const formatted = data.articles
            .filter(a => a.title && a.title !== "[Removed]" && a.description && a.urlToImage)
            .map((item, index) => ({
              id: index,
              title: item.title,
              category: typeof item.source === 'object' ? item.source.name : item.source || "General",
              date: new Date(item.publishedAt).toDateString(),
              description: item.description || "No description available",
              image: item.urlToImage || "https://via.placeholder.com/400"
            }));

          const fallbackNews = MOCK_NEWS.filter(n => {
            if (category.toLowerCase() === 'about' || category.toLowerCase() === 'contact') return true;
            return n.category.toLowerCase() === category.toLowerCase();
          });

          if (formatted.length > 0) {
            setArticles(formatted);
          } else {
            setArticles(fallbackNews.length > 0 ? fallbackNews : MOCK_NEWS);
          }
        } else {
          const fallbackNews = MOCK_NEWS.filter(n => {
            if (category.toLowerCase() === 'about' || category.toLowerCase() === 'contact') return true;
            return n.category.toLowerCase() === category.toLowerCase();
          });
          setArticles(fallbackNews.length > 0 ? fallbackNews : MOCK_NEWS);
        }
      } catch (err) {
        console.error("API ERROR:", err);
        const fallbackNews = MOCK_NEWS.filter(n => {
          if (category.toLowerCase() === 'about' || category.toLowerCase() === 'contact') return true;
          return n.category.toLowerCase() === category.toLowerCase();
        });
        setArticles(fallbackNews.length > 0 ? fallbackNews : MOCK_NEWS);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [category, API_KEY]);

  const handleVerify = (article) => {
    setSelectedArticle(article);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">

      {/* Header */}
      <div className="mb-16 border-b border-black pb-8 dark:border-white">
        <h1 className="text-5xl md:text-7xl font-bold font-serif tracking-tight mb-4 leading-none">
          Truth Beyond the Surface
        </h1>
        <p className="text-xl text-neutral-500 max-w-2xl font-bold uppercase tracking-widest">
          Curated insights, bold stories, and verified facts.
        </p>
      </div>

      {/* Loader */}
      {loading && (
        <p className="text-center text-lg">Fetching latest news...</p>
      )}

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-16">
        {articles.map(article => (
          <NewsCard
            key={article.id}
            article={article}
            onVerify={handleVerify}
          />
        ))}
      </div>

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