// import React, { useEffect, useState } from 'react';

// const Health = () => {
//   const [limits, setLimits] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const sfAuthData = localStorage.getItem('sfAuthData');
//     if (!sfAuthData) {
//       setError('sfAuthData not found in localStorage');
//       return;
//     }

//     const { accessToken, instanceUrl } = JSON.parse(sfAuthData);

//     fetch('/api/health', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ accessToken, instanceUrl }),
//     })
//       .then((res) => {
//         if (!res.ok) throw new Error('Request failed');
//         return res.json();
//       })
//       .then((data) => {console.log("data",data); setLimits(data)})
//       .catch((err) => {
//         setError('Failed to fetch org limits');
//         console.error(err);
//       });
//   }, []);

//   return (
//     <div>
//       <h1>Health</h1>
//       {error && <p style={{ color: 'red' }}>{error}</p>}
//       {limits ? (
//         <pre>{JSON.stringify(limits, null, 2)}</pre>
//       ) : (
//         !error && <p>Loading org limits...</p>
//       )}
//     </div>
//   );
// };

// export default Health;


import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, RefreshCw, ChevronDown, Search } from 'lucide-react';

// Component to display a single limit with progress bar
const LimitCard = ({ name, used, max, category }) => {
  const percentage = max > 0 ? ((max - used) / max) * 100 : 0;
  
  // Choose color based on remaining percentage
  let barColor = "bg-green-500";
  if (percentage < 25) barColor = "bg-red-500";
  else if (percentage < 50) barColor = "bg-yellow-500";
  else if (percentage < 75) barColor = "bg-blue-500";
  
  // Format large numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow">
      <h3 className="text-sm font-medium text-gray-800 mb-1 truncate" title={name}>{name}</h3>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className={`${barColor} h-2 rounded-full`} 
          style={{ width: `${percentage > 100 ? 100 : percentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-xs text-gray-600">
        <span>Used: {formatNumber(max - used)}</span>
        <span>Remaining: {formatNumber(used)} ({Math.round(percentage)}%)</span>
        <span>Max: {formatNumber(max)}</span>
      </div>
    </div>
  );
};

// Component to display a category of limits
const CategorySection = ({ title, limits, isOpen, onToggle, searchTerm }) => {
  const filteredLimits = searchTerm 
    ? limits.filter(limit => limit.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : limits;
  
  if (filteredLimits.length === 0) return null;
  
  return (
    <div className="mb-6">
      <div 
        className="flex items-center justify-between p-3 bg-gray-100 rounded-lg cursor-pointer"
        onClick={onToggle}
      >
        <h2 className="text-lg font-semibold text-gray-800">{title} ({filteredLimits.length})</h2>
        <ChevronDown 
          className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          size={20} 
        />
      </div>
      
      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
          {filteredLimits.map((limit) => (
            <LimitCard 
              key={limit.name} 
              name={limit.name} 
              used={limit.remaining} 
              max={limit.max} 
              category={title}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Main component
const EnhancedHealthDashboard = () => {
  const [limits, setLimits] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openCategories, setOpenCategories] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  
  // Categories for organizing limits
  const categories = {
    "API Usage": ["DailyApiRequests", "DailyBulkApiBatches", "HourlyODataCallout"],
    "Storage": ["DataStorageMB", "FileStorageMB", "AnalyticsExternalDataSizeMB", "DailyAnalyticsUploadedFilesSizeMB", "DailyBulkV2QueryFileStorageMB"],
    "Async Processing": ["DailyAsyncApexExecutions", "DailyAsyncApexTests", "ConcurrentAsyncGetReportInstances", "HourlyAsyncReportRuns"],
    "Events & Streaming": ["DailyStreamingApiEvents", "DailyGenericStreamingApiEvents", "DailyDurableStreamingApiEvents", "DailyDurableGenericStreamingApiEvents", "DailyDeliveredPlatformEvents", "DailyStandardVolumePlatformEvents", "HourlyPublishedPlatformEvents", "HourlyPublishedStandardVolumePlatformEvents", "StreamingApiConcurrentClients", "DurableStreamingApiConcurrentClients"],
    "Analytics & Einstein": ["DailyAnalyticsDataflowJobExecutions", "DailyEinsteinDataInsightsStoryCreation", "DailyEinsteinDiscoveryStoryCreation", "ConcurrentEinsteinDataInsightsStoryCreation", "ConcurrentEinsteinDiscoveryStoryCreation", "DailyEinsteinDiscoveryOptimizationJobRuns", "DailyEinsteinDiscoveryPredictAPICalls", "DailyEinsteinDiscoveryPredictionsByCDC", "MonthlyEinsteinDiscoveryStoryCreation", "CdpAiInferenceApiMonthlyLimit"],
    "Reports & Dashboards": ["HourlyDashboardRefreshes", "HourlyDashboardResults", "HourlyDashboardStatuses", "HourlySyncReportRuns", "ConcurrentSyncReportRuns", "HourlyElevateAsyncReportRuns", "HourlyElevateSyncReportRuns"],
    "Email & Workflows": ["DailyWorkflowEmails", "MassEmail", "SingleEmail", "HourlyTimeBasedWorkflow"],
    "ID Mapping": ["HourlyLongTermIdMapping", "HourlyShortTermIdMapping"],
    "Package & Permissions": ["Package2VersionCreates", "Package2VersionCreatesWithoutValidation", "PermissionSets"],
    "Other": []
  };

  useEffect(() => {
    // Try to load from local storage first while the API is fetching
    const cachedData = localStorage.getItem('healthData');
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        setLimits(parsedData);
      } catch (e) {
        console.error("Failed to parse cached health data");
      }
    }

    fetchData();
    
    // Initialize all categories as open
    const initialOpenState = {};
    Object.keys(categories).forEach(category => {
      initialOpenState[category] = true;
    });
    setOpenCategories(initialOpenState);
  }, []);

  const fetchData = () => {
    setLoading(true);
    
    const sfAuthData = localStorage.getItem('sfAuthData');
    if (!sfAuthData) {
      setError('Authentication data not found. Please log in to Salesforce first.');
      setLoading(false);
      return;
    }

    const { accessToken, instanceUrl } = JSON.parse(sfAuthData);

    fetch('/api/health', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, instanceUrl }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Request failed');
        return res.json();
      })
      .then((data) => {
        setLimits(data);
        setLoading(false);
        localStorage.setItem('healthData', JSON.stringify(data));
      })
      .catch((err) => {
        setError('Failed to fetch org limits. Please check your connection or try again later.');
        setLoading(false);
        console.error(err);
      });
  };

  const toggleCategory = (category) => {
    setOpenCategories({
      ...openCategories,
      [category]: !openCategories[category]
    });
  };

  const organizeDataIntoCategories = () => {
    if (!limits || !limits.data) return {};

    const organized = {};
    const categorizedItems = new Set();

    // First, organize limits into predefined categories
    Object.keys(categories).forEach(category => {
      organized[category] = [];
      
      categories[category].forEach(limitKey => {
        if (limits.data[limitKey]) {
          organized[category].push({
            name: limitKey,
            max: limits.data[limitKey].Max,
            remaining: limits.data[limitKey].Remaining
          });
          categorizedItems.add(limitKey);
        }
      });
    });

    // Add uncategorized items to "Other"
    Object.keys(limits.data).forEach(limitKey => {
      if (!categorizedItems.has(limitKey)) {
        organized["Other"].push({
          name: limitKey,
          max: limits.data[limitKey].Max,
          remaining: limits.data[limitKey].Remaining
        });
      }
    });

    return organized;
  };

  const organizedData = limits ? organizeDataIntoCategories() : {};
  
  // Count critical limits (< 25% remaining)
  const getCriticalCount = () => {
    let count = 0;
    if (!limits || !limits.data) return count;
    
    Object.keys(limits.data).forEach(key => {
      const limit = limits.data[key];
      if (typeof limit.Max === 'number' && typeof limit.Remaining === 'number') {
        const percentage = (limit.Remaining / limit.Max) * 100;
        if (percentage < 25 && limit.Max > 0) count++;
      }
    });
    
    return count;
  };
  
  const criticalCount = limits ? getCriticalCount() : 0;

  // Summary stats calculations
  const calculateSummary = () => {
    if (!limits || !limits.data) return { total: 0, healthy: 0, warning: 0, critical: 0 };
    
    let total = 0;
    let healthy = 0;
    let warning = 0;
    let critical = 0;
    
    Object.keys(limits.data).forEach(key => {
      const limit = limits.data[key];
      if (typeof limit.Max === 'number' && typeof limit.Remaining === 'number' && limit.Max > 0) {
        total++;
        const percentage = (limit.Remaining / limit.Max) * 100;
        
        if (percentage < 25) critical++;
        else if (percentage < 50) warning++;
        else healthy++;
      }
    });
    
    return { total, healthy, warning, critical };
  };
  
  const summary = limits ? calculateSummary() : { total: 0, healthy: 0, warning: 0, critical: 0 };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Salesforce Organization Health</h1>
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>
      
      {error && (
        <div className="mb-6 p-4 border-l-4 border-red-500 bg-red-50 text-red-700">
          <div className="flex items-center">
            <AlertCircle className="mr-2" size={20} />
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {limits && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg shadow-sm bg-white border">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-600">Total Limits</h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {summary.total}
                </span>
              </div>
            </div>
            
            <div className="p-4 rounded-lg shadow-sm bg-white border">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-600">Healthy</h3>
                <div className="flex items-center gap-1">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {summary.healthy}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-lg shadow-sm bg-white border">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-600">Warning</h3>
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {summary.warning}
                </span>
              </div>
            </div>
            
            <div className="p-4 rounded-lg shadow-sm bg-white border">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-600">Critical</h3>
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {summary.critical}
                </span>
              </div>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-500" />
            </div>
            <input
              type="search"
              className="block w-full p-2 pl-10 text-sm border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search limits by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Categories */}
          {Object.keys(organizedData).map((category) => (
            <CategorySection
              key={category}
              title={category}
              limits={organizedData[category]}
              isOpen={openCategories[category]}
              onToggle={() => toggleCategory(category)}
              searchTerm={searchTerm}
            />
          ))}
        </>
      )}
      
      {!limits && !error && (
        <div className="flex flex-col items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mb-4"></div>
          <p className="text-gray-600">Loading organization limits...</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedHealthDashboard;