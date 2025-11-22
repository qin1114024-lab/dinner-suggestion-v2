import React, { useState } from 'react';
import { Restaurant } from '../types';
import StarRating from './StarRating';
import { MapPin, Globe, Calendar, MessageSquare, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

interface Props {
  data: Restaurant;
}

const RestaurantCard: React.FC<Props> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Generate a consistent placeholder image based on name char code
  const seed = data.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const imageUrl = `https://picsum.photos/seed/${seed}/400/250`;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100 flex flex-col h-full">
      <div className="relative h-48 w-full overflow-hidden group">
        <img 
          src={imageUrl} 
          alt={data.name} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm">
          {data.category}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 leading-tight">{data.name}</h3>
          <div className="flex flex-col items-end">
             <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded font-medium">
               {data.rating}
             </span>
          </div>
        </div>

        <div className="mb-3">
           <StarRating rating={data.rating} count={data.reviewCount} />
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-grow">
          {data.description}
        </p>

        <div className="flex items-start text-gray-500 text-xs mb-4">
          <MapPin size={14} className="mt-0.5 mr-1 flex-shrink-0" />
          <a href={data.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline">
            {data.address}
          </a>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4">
          {data.reservationUrl && (
            <a 
              href={data.reservationUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center transition-colors"
            >
              <Calendar size={14} className="mr-1.5" />
              線上訂位
            </a>
          )}
          {data.websiteUrl && (
            <a 
              href={data.websiteUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center transition-colors"
            >
              <Globe size={14} className="mr-1.5" />
              官網
            </a>
          )}
          {!data.reservationUrl && !data.websiteUrl && (
             <a 
             href={data.googleMapsUrl} 
             target="_blank" 
             rel="noopener noreferrer"
             className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center transition-colors"
           >
             <ExternalLink size={14} className="mr-1.5" />
             Google 地圖
           </a>
          )}
        </div>

        {/* Reviews Section */}
        <div className="border-t border-gray-100 pt-3">
          <div className="bg-orange-50 rounded-lg p-3">
             <div className="flex items-center text-orange-800 text-xs font-bold mb-1">
                <MessageSquare size={12} className="mr-1.5" />
                最熱門評論
             </div>
             <p className="text-gray-700 text-xs italic">
               "{data.topReview}"
             </p>
          </div>

          {data.otherReviews.length > 0 && (
            <div className="mt-2">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-center text-xs text-gray-500 hover:text-gray-700 py-1"
              >
                {isExpanded ? (
                  <>收起其他評論 <ChevronUp size={12} className="ml-1" /></>
                ) : (
                  <>更多評論摘要 <ChevronDown size={12} className="ml-1" /></>
                )}
              </button>
              
              {isExpanded && (
                <div className="mt-2 space-y-2 pl-2 border-l-2 border-gray-200 animate-fadeIn">
                  {data.otherReviews.map((review, idx) => (
                    <p key={idx} className="text-xs text-gray-600">
                      • {review}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;