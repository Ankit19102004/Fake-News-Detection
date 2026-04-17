import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const NewsCard = ({ article, onVerify }) => {
  return (
    <div className="flex flex-col h-full group hover:-translate-y-1 transition-transform duration-300">
      {/* Image container */}
      <div className="relative aspect-4/3 w-full overflow-hidden mb-4 bg-neutral-100 dark:bg-neutral-800">
        <img 
          src={article.image} 
          alt={article.title}
          className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-105"
        />
        {/* Category Overlay */}
        <div className="absolute bottom-0 left-0 bg-black/80 backdrop-blur-sm px-3 py-1">
          <span className="text-xs font-bold uppercase tracking-widest text-white">
            {article.category}
          </span>
        </div>
      </div>
      
      {/* Meta Date */}
      <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 flex items-center gap-2">
        <span>{article.date}</span>
      </div>
      
      {/* Title */}
      <h3 className="text-2xl font-bold leading-tight mb-3 text-neutral-900 grow dark:text-neutral-100 font-serif">
        {article.title}
      </h3>
      
      {/* Description */}
      <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-6 line-clamp-3">
        {article.description}
      </p>

      {/* Actions */}
      <div className="mt-auto pt-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
        <button 
          onClick={() => onVerify(article)}
          className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide bg-neutral-900 border border-neutral-900 text-white dark:bg-white dark:text-black dark:border-white px-4 py-2 hover:bg-black hover:text-white dark:hover:bg-neutral-200 transition-colors"
        >
          <ShieldCheck size={18} />
          Verify News
        </button>
      </div>
    </div>
  );
};
