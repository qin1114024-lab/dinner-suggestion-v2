export interface Review {
  author: string;
  text: string;
  rating: number;
}

export interface Restaurant {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  address: string;
  topReview: string; // The "most liked" review summary provided by AI
  otherReviews: string[]; // A few other review snippets
  websiteUrl?: string;
  reservationUrl?: string;
  googleMapsUrl?: string; // Extracted from grounding or constructed
  description: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type ViewMode = 'top10' | 'all';

export enum Category {
  ALL = '全部',
  HOT_POT = '火鍋',
  JAPANESE = '日式料理',
  WESTERN = '西式/牛排',
  CHINESE = '中式合菜',
  BBQ = '燒肉/烤肉',
  OTHER = '其他'
}