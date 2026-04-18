import React, { useState } from 'react';
import { NewsCard } from '../components/NewsCard';
import { VerificationModal } from '../components/VerificationModal';

const MOCK_NEWS = [
  {
    id: 1,
    title: "Global Markets Rally as Tech Giants Post Record Ecosystem Growth",
    category: "Economy",
    date: "Aug 25 • 2026",
    description: "In an unexpected turn, major technology firms have demonstrated sweeping cross-platform synergies driving unprecedented Q3 revenue.",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=1200&h=800"
  },
  {
    id: 2,
    title: "Australia wins 2023 ICC Cricket World Cup final against India",
    category: "Sport",
    date: "Nov 19 • 2023",
    description: "Australia won the 2023 ICC Men’s Cricket World Cup, defeating host nation India in the final on November 19, 2023, for their sixth title. The tournament, held in India, saw Virat Kohli named Player of the Tournament for his record 765 runs. The event generated a $1.39 billion economic impact and broke viewership records, with the final drawing massive global engagement.",
    image: "https://www.reuters.com/resizer/v2/BNBV7GTOSRIOFAZIFBFKTWQM44.jpg?auth=99c5cbe885c196b142d4bb3be2fa0b78d4fda5ab30e37bb7912bf6c7afb70a79"
  },
  {
    id: 3,
    title: "New Satellite Imaging Reveals Ancient Mega-Structures Beneath Ice",
    category: "Science",
    date: "Feb 17 • 2026",
    description: "Deep radar scans have unearthed what researchers believe to be geometric ruins spanning thousands of kilometers in Antarctica.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200&h=800"
  },
  {
    id: 7,
    title: "The Next Era of Wearable Hardware: Form Meets Ambient Computing",
    category: "Business",
    date: "Apr 14 • 2026",
    description: "Smart wearables are abandoning screens in favor of neural-interfacing aesthetic bands that prioritize subtle vibration feedback.",
    image: "https://images.unsplash.com/photo-1508685096489-0de627670e3c?auto=format&fit=crop&q=80&w=1200&h=800"
  },
  {
    id: 4,
    title: "Synthetic Biology Startup Claims Breakthrough in Coral Reef Restoration",
    category: "Science",
    date: "Sep 22 • 2026",
    description: "Using accelerated epigenetic modification, scientists have grown heat-resistant coral colonies in under six months.",
    image: "https://images.unsplash.com/photo-1546026423-cc46426ba658?auto=format&fit=crop&q=80&w=1200&h=800"
  },
  {
    id: 5,
    title: "Cryptocurrency Volatility Spikes Amid Regulatory Uncertainty",
    category: "Economy",
    date: "Oct 05 • 2026",
    description: "Digital assets saw wild swings this morning as new oversight frameworks were leaked to international press.",
    image: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&q=80&w=1200&h=800"
  },
  {
    id: 6,
    title: "Autonomous Logistics Network Expanding Across Eurasian Corridors",
    category: "Business",
    date: "Jan 12 • 2026",
    description: "Freight fleets operating entirely without human oversight have completed their ten-thousandth successful intercontinental delivery.",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200&h=800"
  },

];

export const Home = () => {
  const [selectedArticle, setSelectedArticle] = useState(null);

  const handleVerify = (article) => {
    setSelectedArticle(article);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">

      {/* Featured Header */}
      <div className="mb-16 border-b border-black pb-8 dark:border-white">
        <h1 className="text-5xl md:text-7xl font-bold font-serif tracking-tight mb-4 leading-none">
          Truth Beyond the Surface
        </h1>
        <p className="text-xl text-neutral-500 max-w-2xl font-bold uppercase tracking-widest">
          Curated insights, bold stories, and verified facts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-16">
        {MOCK_NEWS.map(article => (
          <NewsCard
            key={article.id}
            article={article}
            onVerify={handleVerify}
          />
        ))}
      </div>

      {selectedArticle && (
        <VerificationModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  );
};