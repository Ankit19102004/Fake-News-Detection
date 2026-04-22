export const MOCK_NEWS = [
  {
    id: 1,
    title: "Global Markets Rally as Tech Giants Post Record Ecosystem Growth",
    category: "Economy",
    date: "Aug 25, 2026",
    description: "In an unexpected turn, technology stocks led a broad market rally across global exchanges.",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f",
    content: "Technology shares and AI infrastructure companies helped drive a wider rally in global markets.",
    url: ""
  },
  {
    id: 2,
    title: "Australia wins 2023 ICC Cricket World Cup final against India",
    category: "Top Stories",
    date: "Nov 19, 2023",
    description: "Australia defeated India in the 2023 ICC Men's Cricket World Cup final.",
    image: "https://www.reuters.com/resizer/v2/BNBV7GTOSRIOFAZIFBFKTWQM44.jpg?auth=99c5cbe885c196b142d4bb3be2fa0b78d4fda5ab30e37bb7912bf6c7afb70a79",
    content: "Australia's win in the final capped a successful campaign and ended India's unbeaten run.",
    url: ""
  },
  {
    id: 4,
    title: "India lands Chandrayaan-3 near Moon south pole",
    category: "India",
    date: "Aug 23, 2023",
    description: "India achieved a historic lunar landing near the Moon's south pole.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
    content: "The mission established India as a major space power and drew international attention.",
    url: ""
  },
  {
    id: 5,
    title: "James Webb telescope reveals deep space images",
    category: "Science",
    date: "Jul 12, 2022",
    description: "NASA released striking new images captured by the James Webb Space Telescope.",
    image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564",
    content: "The images offered new detail on galaxies, nebulae, and distant cosmic structures.",
    url: ""
  },
  {
    id: 6,
    title: "AI infrastructure fuels tech investments",
    category: "Business",
    date: "Sep 10, 2024",
    description: "Demand for AI chips, data centers, and cloud tools is driving business investment.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    content: "Investors continued to back AI infrastructure providers as enterprise adoption accelerated.",
    url: ""
  },
  {
    id: 7,
    title: "Clean energy investment expands globally",
    category: "Economy",
    date: "May 09, 2025",
    description: "Renewable energy and grid modernization projects attracted large funding rounds.",
    image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7",
    content: "Governments and private capital both contributed to rising clean-energy spending.",
    url: ""
  },
  {
    id: 8,
    title: "Archaeologists uncover layered settlement in northern India",
    category: "India",
    date: "Apr 21, 2026",
    description: "Researchers reported a significant archaeological discovery with multiple settlement layers.",
    image: "https://images.unsplash.com/photo-1461360370896-922624d12aa1",
    content: "The site may provide fresh evidence about regional trade, settlement patterns, and fortification methods.",
    url: ""
  },
  {
    id: 9,
    title: "Debate grows around digital trust and verification",
    category: "Top Stories",
    date: "Feb 14, 2026",
    description: "Platforms are under growing pressure to improve transparency and verification systems.",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c",
    content: "Governments, newsrooms, and platforms are all reassessing how to signal trust online.",
    url: ""
  }
];

const CATEGORY_ALIASES = {
  "top stories": ["top stories", "general", "world"],
  india: ["india"],
  science: ["science"],
  economy: ["economy", "finance"],
  business: ["business", "startup", "technology"],
  about: ["all"],
  contact: ["all"]
};

export const getFallbackNews = (category) => {
  const normalizedCategory = (category || "top stories").toLowerCase();

  if (normalizedCategory === "explore") {
    return [];
  }

  if (normalizedCategory === "about" || normalizedCategory === "contact") {
    return MOCK_NEWS;
  }

  const allowedCategories = CATEGORY_ALIASES[normalizedCategory] || [normalizedCategory];
  const filtered = MOCK_NEWS.filter((news) =>
    allowedCategories.includes((news.category || "").toLowerCase())
  );

  return filtered.length > 0 ? filtered : MOCK_NEWS;
};
