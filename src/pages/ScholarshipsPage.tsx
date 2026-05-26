import React, { useEffect, useState, useRef, useCallback } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import Header from "../components/Header";

interface Item {
  title: string;
  originalLink?: string;
  link: string;
  image?: string;
  date?: string;
  scrapedAt?: string;
  category?: string;
}

interface DataResponse {
  fellowships: Item[];
  jobs: Item[];
  scholarships: Item[];
}

const ScholarshipsPage: React.FC = () => {
  const [data, setData] = useState<DataResponse>({
    scholarships: [],
    fellowships: [],
    jobs: [],
  });
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "scholarships" | "fellowships" | "jobs"
  >("scholarships");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const fetchOpportunitiesFromFirestore = useCallback(async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
    }
    setError(null);
    
    try {
      console.log("Fetching opportunities from Firestore...");
      
      const opportunitiesRef = collection(db, "opportunities");
      const q = query(opportunitiesRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      if (!isMountedRef.current) return;
      
      const allOpportunities: Item[] = [];
      let latestTimestamp: Date | null = null;
      
      querySnapshot.forEach((doc) => {
        const item = doc.data();
        allOpportunities.push({
          title: item.title || "Untitled",
          link: item.link || "#",
          originalLink: item.originalLink || item.link,
          image: item.image || "",
          date: item.date || "",
          category: item.category || "",
        });
        
        if (item.createdAt) {
          try {
            let itemDate: Date;
            if (typeof item.createdAt.toDate === 'function') {
              itemDate = item.createdAt.toDate();
            } else if (item.createdAt instanceof Date) {
              itemDate = item.createdAt;
            } else if (typeof item.createdAt === 'string') {
              itemDate = new Date(item.createdAt);
            } else {
              itemDate = new Date();
            }
            if (!latestTimestamp || itemDate > latestTimestamp) {
              latestTimestamp = itemDate;
            }
          } catch (err) {
            console.warn("Could not parse createdAt:", item.createdAt);
          }
        }
      });
      
      if (!isMountedRef.current) return;
      
      console.log(`Fetched ${allOpportunities.length} opportunities`);
      
      const scholarships = allOpportunities.filter(
        (item) =>
          item.category?.toLowerCase() === "scholarship" ||
          item.title?.toLowerCase().includes("scholarship")
      );
      
      const jobs = allOpportunities.filter(
        (item) =>
          item.category?.toLowerCase() === "job" ||
          item.title?.toLowerCase().includes("job") ||
          item.title?.toLowerCase().includes("vacancy")
      );
      
      const fellowships = allOpportunities.filter(
        (item) =>
          item.category?.toLowerCase() === "fellowship" ||
          item.title?.toLowerCase().includes("fellowship")
      );
      
      setData({
        scholarships,
        fellowships,
        jobs,
      });
      
      if (latestTimestamp) {
        setLastUpdated(formatTimestamp(latestTimestamp.toISOString()));
      }
      
    } catch (error) {
      console.error("Firestore fetch error:", error);
      if (isMountedRef.current) {
        setError("Failed to load opportunities. Please check your connection and try again.");
      }
    } finally {
      if (isMountedRef.current && !isBackground) {
        setLoading(false);
      }
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    setError(null);
    
    try {
      await fetchOpportunitiesFromFirestore(true);
      console.log("Data refreshed from Firestore");
    } catch (error) {
      console.error("Failed to refresh:", error);
      setError("Refresh failed. Pull down again to retry.");
    } finally {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      refreshTimerRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setRefreshing(false);
        }
      }, 1000);
    }
  }, [fetchOpportunitiesFromFirestore, refreshing]);

  // Handle pull-to-refresh without breaking normal scrolling
  useEffect(() => {
    let touchStartY = 0;
    let isRefreshing = false;
    let isAtTop = true;
    
    const handleScroll = () => {
      isAtTop = window.scrollY === 0;
    };
    
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        touchStartY = e.touches[0].clientY;
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      // Only handle pull-to-refresh if we're at the top of the page
      if (window.scrollY === 0 && !isRefreshing && !refreshing) {
        const touchCurrentY = e.touches[0].clientY;
        const pullDistance = touchCurrentY - touchStartY;
        
        // Only trigger if pulling down significantly
        if (pullDistance > 80 && !isRefreshing) {
          isRefreshing = true;
          e.preventDefault(); // Only prevent default when actually refreshing
          handleRefresh();
          
          setTimeout(() => {
            isRefreshing = false;
          }, 2000);
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [handleRefresh, refreshing]);

  // Initial load
  useEffect(() => {
    isMountedRef.current = true;
    fetchOpportunitiesFromFirestore();
    
    const interval = setInterval(() => {
      if (isMountedRef.current && !refreshing) {
        console.log("Auto refreshing from Firestore...");
        fetchOpportunitiesFromFirestore(true);
      }
    }, 300000);
    
    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [fetchOpportunitiesFromFirestore, refreshing]);

  // Scroll active tab into view on mobile
  useEffect(() => {
    if (tabsContainerRef.current) {
      const activeTabElement = tabsContainerRef.current.querySelector('.tab-active');
      if (activeTabElement) {
        activeTabElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [activeTab]);

  const renderList = (items: Item[]) => {
    if (loading && !refreshing) return <p className="text-gray-600 text-center py-8">Loading opportunities...</p>;
    
    if (error) {
      return (
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-all"
          >
            Try Again
          </button>
        </div>
      );
    }
    
    if (!Array.isArray(items)) {
      return <p className="text-gray-600 text-center py-8">No data available.</p>;
    }
    
    const filteredItems = items.filter((item) =>
      item.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const sortedItems = [...filteredItems].sort((a: any, b: any) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      return dateB - dateA;
    });
    
    if (sortedItems.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">No results found for "{searchQuery}".</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="mt-2 text-green-600 hover:text-green-700 underline"
            >
              Clear search
            </button>
          )}
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-fr">
        {sortedItems.map((item, idx) => (
          <a
            key={`${item.link}-${idx}`}
            href={item.originalLink || item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="border rounded-2xl shadow-md p-3 hover:shadow-lg hover:scale-105 transition-all bg-white flex flex-col"
          >
            {item.image && (
              <img
                src={item.image}
                alt={item.title || "Opportunity image"}
                className="w-full h-40 object-cover rounded-xl mb-3"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            
            <h2 className="font-semibold text-lg text-gray-800 mb-1 line-clamp-3">
              {item.title}
            </h2>
            
            {item.date && (
              <p className="text-sm text-gray-500 mt-auto pt-2">
                {new Date(item.date).toLocaleDateString()}
              </p>
            )}
          </a>
        ))}
      </div>
    );
  };

  return (
    <>
      <Header />
      <div 
        ref={scrollContainerRef}
        className="min-h-screen bg-gray-100 p-4 md:p-6"
        style={{ overscrollBehavior: 'contain' }}
      >
        <div className="w-full max-w-7xl mx-auto bg-white shadow-md rounded-lg p-4 md:p-6">
          {/* Refresh indicator for pull-to-refresh */}
          {refreshing && (
            <div className="fixed top-0 left-0 right-0 bg-green-500 text-white text-center py-2 z-50 animate-slideDown">
              Refreshing opportunities...
            </div>
          )}
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Opportunities</h2>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-all disabled:opacity-50 text-sm"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          
          {lastUpdated && (
            <p className="text-sm text-gray-500 mb-4">
              Last updated: <span className="font-medium">{lastUpdated}</span>
            </p>
          )}
          
          {/* Modern Scrollable Tabs */}
          <div 
            ref={tabsContainerRef}
            className="overflow-x-auto overflow-y-hidden mb-4 pb-2"
            style={{
              scrollbarWidth: 'thin',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <div className="flex gap-1 min-w-max border-b border-gray-200">
              {["scholarships", "fellowships", "jobs"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab as typeof activeTab);
                    setSearchQuery("");
                  }}
                  className={`
                    px-4 md:px-6 py-3 font-medium whitespace-nowrap transition-all duration-200
                    ${activeTab === tab
                      ? "tab-active border-b-2 border-green-600 text-green-600"
                      : "text-gray-600 hover:text-green-600 border-b-2 border-transparent hover:border-green-300"
                    }
                  `}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span className={`
                    ml-2 px-2 py-0.5 text-xs rounded-full
                    ${activeTab === tab 
                      ? "bg-green-100 text-green-700" 
                      : "bg-gray-100 text-gray-600"
                    }
                  `}>
                    {tab === "scholarships" ? data.scholarships.length :
                     tab === "fellowships" ? data.fellowships.length :
                     data.jobs.length}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Search Section */}
          <div className="mb-6">
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>
          
          {/* Content Section - This area is now scrollable */}
          <div>
            {activeTab === "scholarships" && renderList(data.scholarships)}
            {activeTab === "fellowships" && renderList(data.fellowships)}
            {activeTab === "jobs" && renderList(data.jobs)}
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        /* Ensure normal scrolling works */
        body {
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
        
        /* Allow scroll on the main container */
        .min-h-screen {
          overflow-y: visible;
        }
      `}</style>
    </>
  );
};

export default ScholarshipsPage;