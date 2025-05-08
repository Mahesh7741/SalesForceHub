// 'use client';

// import React, { useEffect, useState, useCallback } from 'react';
// import { saveAs } from 'file-saver';
// import { unparse } from 'papaparse';

// // Constants
// const MAX_RETRIES = 3;
// const RETRY_DELAY = 2000; // 2 seconds
// const FETCH_TIMEOUT = 30000; // 30 seconds

// // Sample data for testing when API is unavailable
// const SAMPLE_DATA = [
//   {
//     Id: 'sample-1',
//     UserId: '005xx000001XxxXXAAX',
//     LoginTime: new Date().toISOString(),
//     SourceIp: '192.168.1.1',
//     LoginType: 'Application',
//     Status: 'Success',
//     Browser: 'Chrome',
//     Application: 'Salesforce for Web',
//     Platform: 'Windows',
//     ApiType: 'N/A',
//     ApiVersion: 'N/A',
//     LoginUrl: 'https://login.salesforce.com'
//   },
//   {
//     Id: 'sample-2',
//     UserId: '005xx000001XxxXXAAY',
//     LoginTime: new Date(Date.now() - 86400000).toISOString(), // Yesterday
//     SourceIp: '10.0.0.1',
//     LoginType: 'Application',
//     Status: 'Failed',
//     Browser: 'Firefox',
//     Application: 'Salesforce for Web',
//     Platform: 'MacOS',
//     ApiType: 'N/A',
//     ApiVersion: 'N/A',
//     LoginUrl: 'https://login.salesforce.com'
//   }
// ];

// const LoginHistory = () => {
//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [retryCount, setRetryCount] = useState(0);
//   const [debugInfo, setDebugInfo] = useState(null);
//   const [useSampleData, setUseSampleData] = useState(false);

//   // Function to fetch data through a proxy if available, or directly if not
//   const fetchData = useCallback(async (retryAttempt = 0) => {
//     // Create abort controller for timeout
//     const controller = new AbortController();
//     const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

//     try {
//       // Get auth data with more detailed error reporting
//       let auth;
//       try {
//         const rawAuth = localStorage.getItem('sfAuthData');
//         setDebugInfo(prev => ({ ...prev, rawAuth: rawAuth ? '(exists)' : '(missing)' }));
        
//         if (!rawAuth) {
//           throw new Error('No Salesforce authentication data found in local storage');
//         }
        
//         auth = JSON.parse(rawAuth);
        
//         if (!auth) {
//           throw new Error('Failed to parse Salesforce authentication data');
//         }
//       } catch (parseError) {
//         throw new Error(`Authentication error: ${parseError.message}`);
//       }

//       // Validate auth data
//       if (!auth?.accessToken) {
//         throw new Error('Missing Salesforce access token. Please log in again.');
//       }
      
//       if (!auth?.instanceUrl) {
//         throw new Error('Missing Salesforce instance URL. Please log in again.');
//       }

//       const { instanceUrl, accessToken } = auth;

//       // Debug logging
//       console.log('Attempting connection to Salesforce...');
//       console.log('Instance URL:', instanceUrl);
//       console.log('Access Token exists:', !!accessToken);
      
//       setDebugInfo(prev => ({
//         ...prev,
//         instanceUrl,
//         hasAccessToken: !!accessToken,
//         timestamp: new Date().toISOString()
//       }));

//       const query = `
//         SELECT Id, UserId, LoginTime, SourceIp, LoginType, Status, Browser, LoginUrl,
//                Application, Platform, ApiType, ApiVersion
//         FROM LoginHistory
//         WHERE LoginTime >= LAST_N_DAYS:30
//         ORDER BY LoginTime DESC
//         LIMIT 100
//       `;

//       // Attempt the API call with detailed logging
//       setDebugInfo(prev => ({ ...prev, fetchStarted: true }));
      
//       // Use proxy server approach to avoid CORS
//       const proxyUrl = '/api/salesforce-proxy'; // This should be your Next.js API route
      
//       const response = await fetch(proxyUrl, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           instanceUrl,
//           accessToken,
//           query: query
//         }),
//         signal: controller.signal,
//       });

//       clearTimeout(timeoutId);
      
//       setDebugInfo(prev => ({ 
//         ...prev, 
//         responseStatus: response.status,
//         responseStatusText: response.statusText,
//         fetchCompleted: true 
//       }));

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(
//           `Salesforce API Error (${response.status}): ${errorText || response.statusText}`
//         );
//       }

//       const data = await response.json();
      
//       setDebugInfo(prev => ({ 
//         ...prev, 
//         hasRecords: !!data.records,
//         recordCount: data.records ? data.records.length : 0
//       }));
      
//       if (!data.records) {
//         throw new Error('Invalid response format from Salesforce API');
//       }

//       setRecords(data.records);
//       setError('');
//       setRetryCount(0);

//     } catch (err) {
//       console.error('Error details:', {
//         message: err.message,
//         name: err.name,
//         stack: err.stack
//       });
      
//       setDebugInfo(prev => ({ 
//         ...prev, 
//         errorName: err.name,
//         errorMessage: err.message,
//         errorStack: err.stack
//       }));

//       if (err.name === 'AbortError') {
//         throw new Error('Connection timed out. Please try again.');
//       }

//       if (retryAttempt < MAX_RETRIES) {
//         console.log(`Retrying... Attempt ${retryAttempt + 1} of ${MAX_RETRIES}`);
//         setTimeout(() => {
//           fetchData(retryAttempt + 1);
//         }, RETRY_DELAY * (retryAttempt + 1)); // Exponential backoff
//         return;
//       }

//       setError(
//         `Failed to fetch login history. ${err.message}. Please verify your network connection and Salesforce authentication.`
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (useSampleData) {
//       setRecords(SAMPLE_DATA);
//       setLoading(false);
//       setError('');
//     } else {
//       fetchData();
//     }
    
//     // Set initial debug info
//     setDebugInfo({
//       initialized: true,
//       timestamp: new Date().toISOString()
//     });
//   }, [fetchData, useSampleData]);

//   const handleRetry = useCallback(() => {
//     setLoading(true);
//     setError('');
//     setRetryCount(prev => prev + 1);
//     fetchData();
//   }, [fetchData]);

//   const toggleSampleData = useCallback(() => {
//     setUseSampleData(prev => !prev);
//   }, []);

//   const downloadCSV = useCallback(() => {
//     if (!records.length) {
//       alert('No data available to download');
//       return;
//     }

//     const formattedRecords = records.map(record => ({
//       ...record,
//       LoginTime: new Date(record.LoginTime).toLocaleString()
//     }));

//     const csvData = unparse(formattedRecords);
//     const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
//     const fileName = `salesforce_login_history_${new Date().toISOString().split('T')[0]}.csv`;
//     saveAs(blob, fileName);
//   }, [records]);

//   // Function to check authentication
//   const checkAuth = useCallback(() => {
//     try {
//       const rawAuth = localStorage.getItem('sfAuthData');
//       if (!rawAuth) {
//         alert("No Salesforce authentication data found in local storage.");
//         return;
//       }
      
//       const auth = JSON.parse(rawAuth);
//       alert(`Auth data found:\nInstance URL: ${auth.instanceUrl}\nAccess Token: ${auth.accessToken ? '(exists)' : '(missing)'}`);
//     } catch (err) {
//       alert(`Error checking auth: ${err.message}`);
//     }
//   }, []);

//   if (loading) {
//     return (
//       <div style={{ textAlign: 'center', padding: '20px' }}>
//         <div style={{
//           border: '4px solid #f3f3f3',
//           borderTop: '4px solid #3498db',
//           borderRadius: '50%',
//           width: '40px',
//           height: '40px',
//           animation: 'spin 1s linear infinite',
//           margin: '0 auto'
//         }} />
//         <p>Loading login history...</p>
//         {retryCount > 0 && (
//           <p style={{ color: '#666' }}>Retry attempt {retryCount} of {MAX_RETRIES}</p>
//         )}
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div style={{
//         padding: '20px',
//         margin: '20px',
//         border: '1px solid #ffcdd2',
//         borderRadius: '4px',
//         backgroundColor: '#ffebee'
//       }}>
//         <h2 style={{ color: '#c62828', marginBottom: '10px' }}>Connection Error</h2>
//         <p style={{ marginBottom: '15px' }}>{error}</p>
//         <div style={{ marginBottom: '15px' }}>
//           <strong>Troubleshooting steps:</strong>
//           <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
//             <li>Check your internet connection</li>
//             <li>Verify your Salesforce credentials</li>
//             <li>Try logging out and logging back in</li>
//             <li>Check if you have properly set up the proxy API route</li>
//           </ul>
//         </div>
//         <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
//           <button onClick={handleRetry} style={{
//             padding: '8px 16px',
//             backgroundColor: '#1976d2',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: 'pointer'
//           }}>
//             Retry Connection
//           </button>
//           <button onClick={checkAuth} style={{
//             padding: '8px 16px',
//             backgroundColor: '#ff9800',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: 'pointer'
//           }}>
//             Check Auth Data
//           </button>
//           <button onClick={toggleSampleData} style={{
//             padding: '8px 16px',
//             backgroundColor: '#9c27b0',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: 'pointer'
//           }}>
//             {useSampleData ? 'Try Real API' : 'Use Sample Data'}
//           </button>
//         </div>
        
//         {debugInfo && (
//           <div style={{ 
//             marginTop: '20px', 
//             padding: '10px', 
//             backgroundColor: '#f5f5f5', 
//             border: '1px solid #ddd',
//             borderRadius: '4px'
//           }}>
//             <details>
//               <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Debug Information</summary>
//               <pre style={{ 
//                 whiteSpace: 'pre-wrap', 
//                 fontSize: '12px',
//                 maxHeight: '200px',
//                 overflow: 'auto' 
//               }}>
//                 {JSON.stringify(debugInfo, null, 2)}
//               </pre>
//             </details>
//           </div>
//         )}
//       </div>
//     );
//   }

//   return (
//     <div style={{ padding: '20px' }}>
//       <div style={{ 
//         display: 'flex', 
//         justifyContent: 'space-between', 
//         alignItems: 'center',
//         marginBottom: '20px',
//         flexWrap: 'wrap',
//         gap: '10px'
//       }}>
//         <h1>Salesforce Login History {useSampleData && '(Sample Data)'}</h1>
//         <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
//           <button 
//             onClick={downloadCSV}
//             style={{
//               padding: '8px 16px',
//               backgroundColor: '#4CAF50',
//               color: 'white',
//               border: 'none',
//               borderRadius: '4px',
//               cursor: 'pointer'
//             }}
//           >
//             Download CSV
//           </button>
//           <button 
//             onClick={checkAuth}
//             style={{
//               padding: '8px 16px',
//               backgroundColor: '#ff9800',
//               color: 'white',
//               border: 'none',
//               borderRadius: '4px',
//               cursor: 'pointer'
//             }}
//           >
//             Check Auth
//           </button>
//           <button 
//             onClick={toggleSampleData}
//             style={{
//               padding: '8px 16px',
//               backgroundColor: useSampleData ? '#f44336' : '#9c27b0',
//               color: 'white',
//               border: 'none',
//               borderRadius: '4px',
//               cursor: 'pointer'
//             }}
//           >
//             {useSampleData ? 'Use Real Data' : 'Use Sample Data'}
//           </button>
//         </div>
//       </div>

//       {records.length === 0 ? (
//         <div style={{
//           padding: '20px',
//           textAlign: 'center',
//           backgroundColor: '#e1f5fe',
//           borderRadius: '4px'
//         }}>
//           <p>No login history records found for the last 30 days.</p>
//         </div>
//       ) : (
//         <div style={{ overflowX: 'auto' }}>
//           <table style={{ 
//             width: '100%', 
//             borderCollapse: 'collapse',
//             backgroundColor: 'white',
//             boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
//           }}>
//             <thead>
//               <tr style={{ backgroundColor: '#f5f5f5' }}>
//                 <th style={tableHeaderStyle}>Login Time</th>
//                 <th style={tableHeaderStyle}>User ID</th>
//                 <th style={tableHeaderStyle}>Application</th>
//                 <th style={tableHeaderStyle}>IP Address</th>
//                 <th style={tableHeaderStyle}>Status</th>
//                 <th style={tableHeaderStyle}>Browser</th>
//               </tr>
//             </thead>
//             <tbody>
//               {records.map((record) => (
//                 <tr key={record.Id} style={{ borderBottom: '1px solid #ddd' }}>
//                   <td style={tableCellStyle}>{new Date(record.LoginTime).toLocaleString()}</td>
//                   <td style={tableCellStyle}>{record.UserId}</td>
//                   <td style={tableCellStyle}>{record.Application || 'N/A'}</td>
//                   <td style={tableCellStyle}>{record.SourceIp}</td>
//                   <td style={tableCellStyle}>
//                     <span style={{
//                       padding: '4px 8px',
//                       borderRadius: '12px',
//                       backgroundColor: record.Status === 'Success' ? '#e8f5e9' : '#ffebee',
//                       color: record.Status === 'Success' ? '#2e7d32' : '#c62828'
//                     }}>
//                       {record.Status}
//                     </span>
//                   </td>
//                   <td style={tableCellStyle}>{record.Browser || 'N/A'}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// const tableHeaderStyle = {
//   padding: '12px',
//   textAlign: 'left',
//   borderBottom: '2px solid #ddd',
//   fontWeight: '600'
// };

// const tableCellStyle = {
//   padding: '12px',
//   textAlign: 'left'
// };

// export default LoginHistory;



'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { saveAs } from 'file-saver';
import { unparse } from 'papaparse';

// Constants
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds
const FETCH_TIMEOUT = 30000; // 30 seconds

// Sample data for testing when API is unavailable
const SAMPLE_DATA = [
  {
    Id: 'sample-1',
    UserId: '005xx000001XxxXXAAX',
    LoginTime: new Date().toISOString(),
    SourceIp: '192.168.1.1',
    LoginType: 'Application',
    Status: 'Success',
    Browser: 'Chrome',
    Application: 'Salesforce for Web',
    Platform: 'Windows',
    ApiType: 'N/A',
    ApiVersion: 'N/A',
    LoginUrl: 'https://login.salesforce.com'
  },
  {
    Id: 'sample-2',
    UserId: '005xx000001XxxXXAAY',
    LoginTime: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    SourceIp: '10.0.0.1',
    LoginType: 'Application',
    Status: 'Failed',
    Browser: 'Firefox',
    Application: 'Salesforce for Web',
    Platform: 'MacOS',
    ApiType: 'N/A',
    ApiVersion: 'N/A',
    LoginUrl: 'https://login.salesforce.com'
  }
];

const LoginHistory = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState(null);
  const [useSampleData, setUseSampleData] = useState(false);
  const [recordLimit, setRecordLimit] = useState(100);
  const [dateRange, setDateRange] = useState(30); // Default to last 30 days

  // Function to fetch data through the API route
  const fetchData = useCallback(async (retryAttempt = 0) => {
    // Reset state for a new fetch attempt
    setDebugInfo(prev => ({
      ...prev,
      fetchStarted: true,
      fetchAttempt: retryAttempt + 1,
      timestamp: new Date().toISOString()
    }));
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
      // Get auth data with more detailed error reporting
      let auth;
      try {
        const rawAuth = localStorage.getItem('sfAuthData');
        setDebugInfo(prev => ({ ...prev, rawAuth: rawAuth ? '(exists)' : '(missing)' }));
        
        if (!rawAuth) {
          throw new Error('No Salesforce authentication data found in local storage');
        }
        
        auth = JSON.parse(rawAuth);
        
        if (!auth) {
          throw new Error('Failed to parse Salesforce authentication data');
        }
      } catch (parseError) {
        throw new Error(`Authentication error: ${parseError.message}`);
      }

      // Validate auth data
      if (!auth?.accessToken) {
        throw new Error('Missing Salesforce access token. Please log in again.');
      }
      
      if (!auth?.instanceUrl) {
        throw new Error('Missing Salesforce instance URL. Please log in again.');
      }

      const { instanceUrl, accessToken } = auth;

      // Build the SOQL query
      const query = `
        SELECT Id, UserId, LoginTime, SourceIp, LoginType, Status, Browser, LoginUrl,
               Application, Platform, ApiType, ApiVersion
        FROM LoginHistory
        WHERE LoginTime >= LAST_N_DAYS:${dateRange}
        ORDER BY LoginTime DESC
        LIMIT ${recordLimit}
      `;

      // Debug logging
      console.log('Attempting to fetch login history from Salesforce...');
      setDebugInfo(prev => ({
        ...prev,
        instanceUrl,
        hasAccessToken: !!accessToken,
        query,
        limit: recordLimit,
        dateRange
      }));

      // Make the API request to our proxy endpoint
      const response = await fetch('/api/loginHistory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instanceUrl,
          accessToken,
          query,
          limit: recordLimit
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      // Update debug info with response details
      setDebugInfo(prev => ({ 
        ...prev, 
        responseStatus: response.status,
        responseStatusText: response.statusText,
        fetchCompleted: true 
      }));

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorText = errorData?.error || response.statusText;
        throw new Error(`Salesforce API Error (${response.status}): ${errorText}`);
      }

      // Parse and process the response
      const data = await response.json();
      
      setDebugInfo(prev => ({ 
        ...prev, 
        hasRecords: !!data.records,
        recordCount: data.records ? data.records.length : 0,
        totalSize: data.totalSize,
        done: data.done
      }));
      
      // Validate the response format
      if (!data.records) {
        throw new Error('Invalid response format from Salesforce API');
      }

      // Update state with the fetched records
      setRecords(data.records);
      setError('');
      setRetryCount(0);

    } catch (err) {
      console.error('Error fetching login history:', {
        message: err.message,
        name: err.name,
        stack: err.stack
      });
      
      setDebugInfo(prev => ({ 
        ...prev, 
        errorName: err.name,
        errorMessage: err.message,
        errorStack: err.stack
      }));

      // Handle timeout errors
      if (err.name === 'AbortError') {
        throw new Error('Connection timed out. Please try again.');
      }

      // Implement retry logic
      if (retryAttempt < MAX_RETRIES) {
        console.log(`Retrying... Attempt ${retryAttempt + 1} of ${MAX_RETRIES}`);
        setTimeout(() => {
          fetchData(retryAttempt + 1);
        }, RETRY_DELAY * (retryAttempt + 1)); // Exponential backoff
        return;
      }

      // Set final error message after all retries
      setError(
        `Failed to fetch login history. ${err.message}. Please verify your network connection and Salesforce authentication.`
      );
    } finally {
      setLoading(false);
    }
  }, [dateRange, recordLimit]);

  // Initialize component
  useEffect(() => {
    if (useSampleData) {
      // Use sample data instead of fetching from API
      setRecords(SAMPLE_DATA);
      setLoading(false);
      setError('');
    } else {
      // Fetch real data from API
      fetchData();
    }
    
    // Set initial debug info
    setDebugInfo({
      initialized: true,
      timestamp: new Date().toISOString()
    });
  }, [fetchData, useSampleData]);

  // Handler for retry button
  const handleRetry = useCallback(() => {
    setLoading(true);
    setError('');
    setRetryCount(prev => prev + 1);
    fetchData();
  }, [fetchData]);

  // Handler for toggling between real and sample data
  const toggleSampleData = useCallback(() => {
    setUseSampleData(prev => !prev);
  }, []);

  // Handler for downloading data as CSV
  const downloadCSV = useCallback(() => {
    if (!records.length) {
      alert('No data available to download');
      return;
    }

    // Format dates for better readability in CSV
    const formattedRecords = records.map(record => ({
      ...record,
      LoginTime: new Date(record.LoginTime).toLocaleString()
    }));

    // Generate and download the CSV file
    const csvData = unparse(formattedRecords);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
    const fileName = `salesforce_login_history_${new Date().toISOString().split('T')[0]}.csv`;
    saveAs(blob, fileName);
  }, [records]);

  // Handler for checking authentication
  const checkAuth = useCallback(() => {
    try {
      const rawAuth = localStorage.getItem('sfAuthData');
      if (!rawAuth) {
        alert("No Salesforce authentication data found in local storage.");
        return;
      }
      
      const auth = JSON.parse(rawAuth);
      alert(`Auth data found:\nInstance URL: ${auth.instanceUrl}\nAccess Token: ${auth.accessToken ? '(exists)' : '(missing)'}`);
    } catch (err) {
      alert(`Error checking auth: ${err.message}`);
    }
  }, []);

  // Handler for updating record limit
  const handleLimitChange = useCallback((e) => {
    const newLimit = parseInt(e.target.value, 10);
    setRecordLimit(newLimit);
  }, []);

  // Handler for updating date range
  const handleDateRangeChange = useCallback((e) => {
    const newRange = parseInt(e.target.value, 10);
    setDateRange(newRange);
  }, []);

  // Handler for applying filter changes
  const applyFilters = useCallback(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  // Loading state UI
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }} />
        <p>Loading login history...</p>
        {retryCount > 0 && (
          <p style={{ color: '#666' }}>Retry attempt {retryCount} of {MAX_RETRIES}</p>
        )}
      </div>
    );
  }

  // Error state UI
  if (error) {
    return (
      <div style={{
        padding: '20px',
        margin: '20px',
        border: '1px solid #ffcdd2',
        borderRadius: '4px',
        backgroundColor: '#ffebee'
      }}>
        <h2 style={{ color: '#c62828', marginBottom: '10px' }}>Connection Error</h2>
        <p style={{ marginBottom: '15px' }}>{error}</p>
        <div style={{ marginBottom: '15px' }}>
          <strong>Troubleshooting steps:</strong>
          <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
            <li>Check your internet connection</li>
            <li>Verify your Salesforce credentials</li>
            <li>Try logging out and logging back in</li>
            <li>Check if you have properly set up the proxy API route</li>
          </ul>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={handleRetry} style={{
            padding: '8px 16px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Retry Connection
          </button>
          <button onClick={checkAuth} style={{
            padding: '8px 16px',
            backgroundColor: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Check Auth Data
          </button>
          <button onClick={toggleSampleData} style={{
            padding: '8px 16px',
            backgroundColor: '#9c27b0',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            {useSampleData ? 'Try Real API' : 'Use Sample Data'}
          </button>
        </div>
        
        {debugInfo && (
          <div style={{ 
            marginTop: '20px', 
            padding: '10px', 
            backgroundColor: '#f5f5f5', 
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}>
            <details>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Debug Information</summary>
              <pre style={{ 
                whiteSpace: 'pre-wrap', 
                fontSize: '12px',
                maxHeight: '200px',
                overflow: 'auto' 
              }}>
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    );
  }

  // Normal state UI (data loaded successfully)
  return (
    <div style={{ padding: '20px' }}>
      {/* Header Section */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <h1>Salesforce Login History {useSampleData && '(Sample Data)'}</h1>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={downloadCSV}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Download CSV
          </button>
          <button 
            onClick={checkAuth}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ff9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Check Auth
          </button>
          <button 
            onClick={toggleSampleData}
            style={{
              padding: '8px 16px',
              backgroundColor: useSampleData ? '#f44336' : '#9c27b0',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {useSampleData ? 'Use Real Data' : 'Use Sample Data'}
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      {!useSampleData && (
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '15px',
          borderRadius: '4px',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '15px',
          alignItems: 'center'
        }}>
          <div>
            <label htmlFor="dateRange" style={{ marginRight: '8px', fontWeight: 'bold' }}>
              Date Range:
            </label>
            <select
              id="dateRange"
              value={dateRange}
              onChange={handleDateRangeChange}
              style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="7">Last 7 days</option>
              <option value="14">Last 14 days</option>
              <option value="30">Last 30 days</option>
              <option value="60">Last 60 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
          <div>
            <label htmlFor="recordLimit" style={{ marginRight: '8px', fontWeight: 'bold' }}>
              Record Limit:
            </label>
            <select
              id="recordLimit"
              value={recordLimit}
              onChange={handleLimitChange}
              style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="10">10 records</option>
              <option value="25">25 records</option>
              <option value="50">50 records</option>
              <option value="100">100 records</option>
              <option value="200">200 records</option>
            </select>
          </div>
          <button
            onClick={applyFilters}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Apply Filters
          </button>
        </div>
      )}

      {/* Data Table */}
      {records.length === 0 ? (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#e1f5fe',
          borderRadius: '4px'
        }}>
          <p>No login history records found for the selected time period.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            backgroundColor: 'white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={tableHeaderStyle}>Login Time</th>
                <th style={tableHeaderStyle}>User ID</th>
                <th style={tableHeaderStyle}>Application</th>
                <th style={tableHeaderStyle}>IP Address</th>
                <th style={tableHeaderStyle}>Status</th>
                <th style={tableHeaderStyle}>Browser</th>
                <th style={tableHeaderStyle}>Platform</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.Id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={tableCellStyle}>{new Date(record.LoginTime).toLocaleString()}</td>
                  <td style={tableCellStyle}>{record.UserId}</td>
                  <td style={tableCellStyle}>{record.Application || 'N/A'}</td>
                  <td style={tableCellStyle}>{record.SourceIp}</td>
                  <td style={tableCellStyle}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      backgroundColor: record.Status === 'Success' ? '#e8f5e9' : '#ffebee',
                      color: record.Status === 'Success' ? '#2e7d32' : '#c62828'
                    }}>
                      {record.Status}
                    </span>
                  </td>
                  <td style={tableCellStyle}>{record.Browser || 'N/A'}</td>
                  <td style={tableCellStyle}>{record.Platform || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ 
            marginTop: '10px', 
            textAlign: 'right', 
            color: '#666', 
            fontSize: '14px' 
          }}>
            Showing {records.length} records
          </div>
        </div>
      )}
    </div>
  );
};

const tableHeaderStyle = {
  padding: '12px',
  textAlign: 'left',
  borderBottom: '2px solid #ddd',
  fontWeight: '600'
};

const tableCellStyle = {
  padding: '12px',
  textAlign: 'left'
};

export default LoginHistory;