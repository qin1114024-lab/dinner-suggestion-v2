import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface Props {
  rating: number;
  count?: number;
}

const StarRating: React.FC<Props> = ({ rating, count }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center space-x-1">
      <div className="flex text-yellow-400">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} size={16} fill="currentColor" />
        ))}
        {hasHalfStar && <StarHalf size={16} fill="currentColor" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} size={16} className="text-gray-300" />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs text-gray-500 ml-1">({count})</span>
      )}
    </div>
  );
};

export default StarRating;