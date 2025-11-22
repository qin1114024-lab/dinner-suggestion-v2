import React from 'react';
import { Category } from '../types.ts';

interface Props {
  selected: string;
  onSelect: (category: string) => void;
}

const CategoryFilter: React.FC<Props> = ({ selected, onSelect }) => {
  const categories = Object.values(Category);

  return (
    <div className="sticky top-[60px] z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm py-3">
      <div className="max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar">
        <div className="flex space-x-2 min-w-max">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                selected === cat
                  ? 'bg-orange-500 text-white shadow-md transform scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;