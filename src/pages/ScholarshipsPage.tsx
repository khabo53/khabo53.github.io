import React, { useEffect, useState } from "react";
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

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const fetchOpportunitiesFromFirestore = async () => {
    setLoading(true);
    try {
      console.log("📥 Fetching opportunities from Firestore...");
      
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
      
      console.log(`📥 Fetched ${allOpportunities.length} opportunities`);
      
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
      console.error("❌ Firestore fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchOpportunitiesFromFirestore();
      console.log("🔄 Data refreshed from Firestore");
    } catch (error) {
      console.error("❌ Failed to refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOpportunitiesFromFirestore();
    
    const interval = setInterval(() => {
      console.log("⏳ Auto refreshing from Firestore...");
      handleRefresh();
    }, 300000);
    
    return () => clearInterval(interval);
  }, []);

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
                📅 {new Date(item.date).toLocaleDateString()}
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
      <div className="min-h-screen bg-white-100 p-6">
        <div className="w-full h-screen bg-white p-6">
          <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Opportunities</h2>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-all"
              >
                {refreshing ? "Refreshing..." : "🔄 Refresh"}
              </button>
            </div>
            
            {lastUpdated && (
              <p className="text-sm text-gray-500 mb-4">
                📅 Last updated: <span className="font-medium">{lastUpdated}</span>
              </p>
            )}
            
            <div className="flex space-x-4 border-b mb-4">
              {["scholarships", "fellowships", "jobs"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab as typeof activeTab);
                    setSearchQuery("");
                  }}
                  className={`pb-2 px-3 font-medium ${
                    activeTab === tab
                      ? "border-b-2 border-green-600 text-green-600"
                      : "text-gray-600 hover:text-green-600"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            
            <div>
              {activeTab === "scholarships" && renderList(data.scholarships)}
              {activeTab === "fellowships" && renderList(data.fellowships)}
              {activeTab === "jobs" && renderList(data.jobs)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ScholarshipsPage;