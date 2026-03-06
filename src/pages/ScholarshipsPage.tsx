import React, { useEffect, useState } from "react";

interface Item {
  title: string;
  originalLink?: string;
  link: string;
  image?: string;
  date?: string;
  scrapedAt?: string;
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

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/scholarships");
      const result = await res.json();
      console.log("📥 API result:", result);

      if (result.success) {
        // ✅ Combine all posts into one array, then sort by type
const allPosts = [
  ...(result.data?.scholarships || []),
  ...(result.data?.jobs || []),
  ...(result.data?.fellowships || []),
];

// ✅ Categorize automatically
const scholarships = allPosts.filter(
  (item) =>
    item.title?.toLowerCase().includes("scholarship") ||
    item.link?.toLowerCase().includes("scholarship")
);

const jobs = allPosts.filter(
  (item) =>
    item.title?.toLowerCase().includes("job") ||
    item.link?.toLowerCase().includes("career") ||
    item.link?.toLowerCase().includes("vacancy")
);

const fellowships = allPosts.filter(
  (item) =>
    item.title?.toLowerCase().includes("fellowship") ||
    item.link?.toLowerCase().includes("fellowship")
);

setData({
  scholarships,
  fellowships,
  jobs,
});


        if (result.lastUpdated) {
          setLastUpdated(formatTimestamp(result.lastUpdated));
        }
      } else {
        console.error("❌ Failed to fetch:", result.error);
      }
    } catch (error) {
      console.error("❌ Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(
        "http://localhost:5000/api/scholarships/refresh",
        { method: "POST" }
      );
      const refreshResult = await res.json();
      console.log("🔄 Refresh response:", refreshResult);

      await fetchOpportunities();
    } catch (error) {
      console.error("❌ Failed to refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  {/*useEffect(() => {
    fetchOpportunities();
  }, []);*/}
  const handleAutoRefresh = async () => {
  try {
    await fetch("http://localhost:5000/api/scholarships/refresh", {
      method: "POST",
    });

    await fetchOpportunities();
  } catch (error) {
    console.error("❌ Auto refresh failed:", error);
  }
};
  useEffect(() => {
  // 1️⃣ Initial load
  fetchOpportunities();

  // 2️⃣ Auto refresh every 5 minutes
  const interval = setInterval(() => {
    console.log("⏳ Auto refreshing...");
    handleAutoRefresh();
  }, 300000); // 300000ms = 5 minutes

  return () => clearInterval(interval); // cleanup
}, []);

  const renderList = (items: Item[]) => {
  if (loading) return <p className="text-gray-600">Loading...</p>;

  if (!Array.isArray(items)) {
    console.error("❌ Items is not an array:", items);
    return <p className="text-gray-600">No data available.</p>;
  }

  // ✅ Apply search filter
  const filteredItems = items.filter((item) =>
    item.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ✅ Sort by date (newest first) — only if `date` property exists
  const sortedItems = [...filteredItems].sort((a: any, b: any) => {
    const dateA = new Date(a.date || 0).getTime();
    const dateB = new Date(b.date || 0).getTime();
    return dateB - dateA;
  });

  if (sortedItems.length === 0)
    return <p className="text-gray-600">No results found.</p>;

  // ✅ Display in rows and columns
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
    <div className="min-h-screen bg-white-100 p-6">
      <div className="w-full h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Opportunities</h2>
          {/*<button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            {refreshing ? "Refreshing..." : "🔄 Refresh"}
          </button>*/}
          <button
           onClick={handleRefresh}
           disabled={refreshing}
           className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-all"
         >
          {refreshing ? "Refreshing..." : "🔄 Refresh"}
          </button>
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <p className="text-sm text-gray-500 mb-4">
            📅 Last updated: <span className="font-medium">{lastUpdated}</span>
          </p>
        )}

        {/* Tabs */}
        <div className="flex space-x-4 border-b mb-4">
          {["scholarships", "fellowships", "jobs"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab as typeof activeTab);
                setSearchQuery(""); // reset search when changing tab
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

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        {/* Content */}
        <div>
          {activeTab === "scholarships" && renderList(data.scholarships)}
          {activeTab === "fellowships" && renderList(data.fellowships)}
          {activeTab === "jobs" && renderList(data.jobs)}
        </div>
      </div>
    </div>
    </div>
  );
};

export default ScholarshipsPage;
