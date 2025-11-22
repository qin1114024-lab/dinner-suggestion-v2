import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Utensils, RefreshCw, AlertCircle, Search, ArrowRight, ChefHat } from 'lucide-react';
import { Restaurant, Coordinates, Category, ViewMode } from './types.ts';
import { fetchRecommendations } from './services/geminiService.ts';
import RestaurantCard from './components/RestaurantCard.tsx';
import CategoryFilter from './components/CategoryFilter.tsx';

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(Category.ALL);
  const [viewMode, setViewMode] = useState<ViewMode>('top10');
  
  // Taipei 101 as default fallback
  const defaultLocation: Coordinates = { latitude: 25.033964, longitude: 121.564468 };

  const handleStart = () => {
    setHasStarted(true);
    getLocation();
  };

  const getLocation = () => {
    setLoading(true);
    setError(null);
    if (!navigator.geolocation) {
      setError("您的瀏覽器不支援地理定位");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setLocation(coords);
      },
      (err) => {
        console.warn("Geolocation denied, using default", err);
        setLocation(defaultLocation);
        setError("無法取得位置，將顯示預設地點（台北 101）附近的餐廳");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    if (location) {
      const loadData = async () => {
        setLoading(true);
        try {
          const data = await fetchRecommendations(location);
          setRestaurants(data);
          setError(null);
        } catch (e) {
          setError("取得餐廳資料失敗，請稍後再試 (Gemini API 可能忙碌中或 API Key 未設定)");
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [location]);

  // Filtering Logic
  const filteredRestaurants = useMemo(() => {
    let filtered = restaurants;
    if (selectedCategory !== Category.ALL) {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }
    // Sort by rating desc
    return filtered.sort((a, b) => b.rating - a.rating);
  }, [restaurants, selectedCategory]);

  const displayedRestaurants = useMemo(() => {
    if (viewMode === 'top10') {
      return filteredRestaurants.slice(0, 10);
    }
    return filteredRestaurants;
  }, [filteredRestaurants, viewMode]);

  // Render Landing Page if not started
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-10 left-10 text-orange-200 opacity-50 transform -rotate-12">
          <Utensils size={120} />
        </div>
        <div className="absolute bottom-10 right-10 text-orange-200 opacity-50 transform rotate-12">
          <ChefHat size={120} />
        </div>

        <div className="bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-2xl max-w-md w-full border border-white relative z-10 text-center">
          <div className="bg-gradient-to-tr from-orange-400 to-red-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-orange-200">
             <Search className="text-white" size={40} />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 tracking-tight">
            晚餐吃什麼？
          </h1>
          
          <p className="text-gray-600 mb-10 leading-relaxed text-lg">
             不再有選擇障礙。<br/>
             我們運用 AI 為您分析評價，<br/>
             找出附近真正值得一試的美食。
          </p>
          
          <button 
             onClick={handleStart}
             className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-orange-300 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 group"
          >
             <span className="text-lg">尋找附近美食</span>
             <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400 bg-gray-50 py-2 px-4 rounded-full inline-flex mx-auto">
             <MapPin size={12} />
             <span>將存取您的位置以提供精準推薦</span>
          </div>
        </div>
        
        <footer className="absolute bottom-4 text-gray-400 text-sm font-medium">
           DinnerSeeker &copy; {new Date().getFullYear()}
        </footer>
      </div>
    );
  }

  // Render Main App
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30 h-[60px] flex items-center border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-1.5 rounded-lg shadow-sm">
              <Utensils className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">晚餐推薦</h1>
          </div>
          
          <button 
            onClick={getLocation} 
            className="text-gray-500 hover:text-orange-600 bg-gray-50 hover:bg-orange-50 p-2 rounded-full transition-all"
            title="重新定位"
            disabled={loading}
          >
             <RefreshCw size={20} className={loading ? "animate-spin text-orange-500" : ""} />
          </button>
        </div>
      </header>

      {/* Category Filter */}
      <CategoryFilter 
        selected={selectedCategory} 
        onSelect={(cat) => {
          setSelectedCategory(cat);
          setViewMode('top10'); // Reset to top 10 on category change
        }} 
      />

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 py-6 w-full">
        
        {/* Error / Location Status */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 flex items-start shadow-sm border border-red-100">
            <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}

        {/* Loading State */}
        {loading && !restaurants.length && (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <div className="relative mb-6">
               <div className="absolute inset-0 bg-orange-200 rounded-full animate-ping opacity-25"></div>
               <div className="bg-white p-4 rounded-full shadow-lg relative z-10">
                 <RefreshCw size={40} className="animate-spin text-orange-500" />
               </div>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">正在搜尋附近的美味晚餐</h3>
            <p className="text-sm text-gray-500">正在分析 Google 地圖評分與熱門評論...</p>
          </div>
        )}

        {/* Content */}
        {!loading && displayedRestaurants.length > 0 && (
          <div className="animate-fadeIn">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  {selectedCategory === Category.ALL ? '精選推薦' : `${selectedCategory}`}
                  {selectedCategory !== Category.ALL && <span className="text-lg font-normal text-gray-500">排行榜</span>}
                </h2>
                <div className="h-1 w-12 bg-orange-500 rounded-full mt-1"></div>
              </div>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                {selectedCategory === Category.ALL ? '附近熱門' : '依評分排序'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} data={restaurant} />
              ))}
            </div>

            {/* Show More Button */}
            {filteredRestaurants.length > 10 && viewMode === 'top10' && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={() => setViewMode('all')}
                  className="group bg-white border-2 border-orange-100 text-orange-600 font-bold py-3 px-8 rounded-full shadow-sm hover:shadow-md hover:border-orange-200 hover:bg-orange-50 transition-all flex items-center"
                >
                  查看更多 {selectedCategory} 餐廳 
                  <span className="ml-2 bg-orange-100 text-orange-700 text-xs py-0.5 px-2 rounded-full">
                    {filteredRestaurants.length - 10}+
                  </span>
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
            
            <div className="mt-16 text-center text-xs text-gray-400 pb-8 border-t border-gray-100 pt-8">
              <p className="mb-1">資料來源：Google Maps & Gemini AI</p>
              <p>評分與評論摘要由 AI 智慧生成，僅供參考</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && displayedRestaurants.length === 0 && !error && (
           <div className="text-center py-20 text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm mx-auto max-w-lg mt-10">
             <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
             <h3 className="text-lg font-medium text-gray-800 mb-2">找不到符合條件的餐廳</h3>
             <p className="text-sm mb-6">試試看切換其他類別，或是重新定位。</p>
             <button 
               onClick={getLocation} 
               className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
             >
               重新搜尋
             </button>
           </div>
        )}
      </main>
    </div>
  );
};

export default App;