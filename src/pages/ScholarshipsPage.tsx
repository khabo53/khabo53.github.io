import React, { useEffect, useState, useRef } from "react";
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
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const fetchOpportunitiesFromFirestore = async () => {
    setLoading(true);
    try {
      console.log("Fetching opportunities from Firestore...");
      
      const opportunitiesRef = collection(db, "opportunities");
      const q = query(opportunitiesRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
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
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchOpportunitiesFromFirestore();
      console.log("Data refreshed from Firestore");
    } catch (error) {
      console.error("Failed to refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOpportunitiesFromFirestore();
    
    const interval = setInterval(() => {
      console.log("Auto refreshing from Firestore...");
      handleRefresh();
    }, 300000);
    
    return () => clearInterval(interval);
  }, []);

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
    if (loading) return <p className="text-gray-600">Loading...</p>;
    
    if (!Array.isArray(items)) {
      return <p className="text-gray-600">No data available.</p>;
    }
    
    const filteredItems = items.filter((item) =>
      item.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const sortedItems = [...filteredItems].sort((a: any, b: any) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      return dateB - dateA;
    });
    
    if (sortedItems.length === 0)
      return <p className="text-gray-600">No results found.</p>;
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-fr">
        {sortedItems.map((item, idx) => (
          <a
            key={idx}
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
              />
            )}
            
            <h2 className="font-semibold text-lg text-gray-800 mb-1 line-clamp-3">
              {item.title}
            </h2>
            
            {item.date && (
              <p className="text-sm text-gray-500">
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
      <div className="min-h-screen bg-gray-100 p-4 md:p-6">
        <div className="w-full max-w-7xl mx-auto bg-white shadow-md rounded-lg p-4 md:p-6">
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
          
          {/* Modern Scrollable Tabs - Fixes Overflow on Mobile */}
          <div 
            ref={tabsContainerRef}
            className="overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 mb-4 pb-2"
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
                  {/* Optional: Add count badge */}
                  <span className={`
                    ml-2 px-2 py-0.5 text-xs rounded-full
                    ${activeTab === tab 
                      ? "bg-green-100 text-green-700" 
                      : "bg-gray-100 text-gray-600"
                    }
                  `}>
                    {activeTab === tab 
                      ? (tab === "scholarships" ? data.scholarships.length :
                         tab === "fellowships" ? data.fellowships.length :
                         data.jobs.length)
                      : (tab === "scholarships" ? data.scholarships.length :
                         tab === "fellowships" ? data.fellowships.length :
                         data.jobs.length)
                    }
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
          
          {/* Content Section */}
          <div>
            {activeTab === "scholarships" && renderList(data.scholarships)}
            {activeTab === "fellowships" && renderList(data.fellowships)}
            {activeTab === "jobs" && renderList(data.jobs)}
          </div>
        </div>
      </div>
    </>
  );
};

export default ScholarshipsPage;