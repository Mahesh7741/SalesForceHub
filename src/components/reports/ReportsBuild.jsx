// // // import React, { useEffect } from 'react';

// // // const ReportsBuild = () => {
// // //   let accessToken = null;
// // //   let instanceUrl = null;

// // //   const savedAuthData = localStorage.getItem('sfAuthData');
// // //   if (savedAuthData) {
// // //     try {
// // //       const parsed = JSON.parse(savedAuthData);
// // //       accessToken = parsed.accessToken;
// // //       instanceUrl = parsed.instanceUrl;

// // //       console.log('Access Token:', accessToken);
// // //       console.log('Instance URL:', instanceUrl);
// // //     } catch (error) {
// // //       console.error('Error parsing auth data:', error);
// // //     }
// // //   }

// // //   const fetchReports = async () => {
// // //     if (!accessToken || !instanceUrl) {
// // //       console.error('Missing Salesforce credentials');
// // //       return;
// // //     }

// // //     try {
// // //       const response = await fetch('/api/reports', {
// // //         method: 'POST',
// // //         headers: {
// // //           'Content-Type': 'application/json',
// // //         },
// // //         body: JSON.stringify({
// // //           accessToken,
// // //           instanceUrl,
// // //           fetchReportData: true,
// // //         }),
// // //       });

// // //       const data = await response.json();
// // //       console.log('Fetched reports:', data);
// // //     } catch (error) {
// // //       console.error('Error fetching reports:', error);
// // //     }
// // //   };

// // //   // Automatically fetch reports on component mount
// // //   useEffect(() => {
// // //     fetchReports();
// // //   }, []);

// // //   return <div>ReportsBuild</div>;
// // // };

// // // export default ReportsBuild;



// // import React, { useState, useEffect } from 'react';

// // const ReportsBuild = () => {
// //   const [loading, setLoading] = useState(true);
// //   const [reports, setReports] = useState([]);
// //   const [dashboards, setDashboards] = useState([]);
// //   const [selectedReport, setSelectedReport] = useState(null);
// //   const [reportData, setReportData] = useState(null);
// //   const [error, setError] = useState(null);

// //   // Fetch reports and dashboards on component mount
// //   useEffect(() => {
// //     fetchReports();
// //   }, []);

// //   const fetchReports = async () => {
// //     setLoading(true);
    
// //     // Get auth data from localStorage
// //     let accessToken = null;
// //     let instanceUrl = null;
    
// //     const savedAuthData = localStorage.getItem('sfAuthData');
// //     if (savedAuthData) {
// //       try {
// //         const parsed = JSON.parse(savedAuthData);
// //         accessToken = parsed.accessToken;
// //         instanceUrl = parsed.instanceUrl;
        
// //         console.log('Access Token:', accessToken);
// //         console.log('Instance URL:', instanceUrl);
// //       } catch (error) {
// //         console.error('Error parsing auth data:', error);
// //         setError('Error parsing Salesforce authentication data');
// //         setLoading(false);
// //         return;
// //       }
// //     } else {
// //       console.error('Missing Salesforce credentials');
// //       setError('No Salesforce authentication data found');
// //       setLoading(false);
// //       return;
// //     }

// //     try {
// //       const response = await fetch('/api/reports', {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify({
// //           accessToken,
// //           instanceUrl,
// //           fetchReportData: false,
// //         }),
// //       });

// //       const data = await response.json();
      
// //       if (data.success) {
// //         setReports(data.reports);
// //         setDashboards(data.dashboards);
// //         console.log('Fetched reports:', data);
// //       } else {
// //         throw new Error(data.error || 'Failed to fetch data from Salesforce');
// //       }
// //     } catch (error) {
// //       console.error('Error fetching reports:', error);
// //       setError(error.message || 'Error fetching Salesforce data');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const fetchReportData = async (reportId) => {
// //     if (!reportId) return;
    
// //     setLoading(true);
    
// //     // Get auth data from localStorage
// //     let accessToken = null;
// //     let instanceUrl = null;
    
// //     const savedAuthData = localStorage.getItem('sfAuthData');
// //     if (savedAuthData) {
// //       try {
// //         const parsed = JSON.parse(savedAuthData);
// //         accessToken = parsed.accessToken;
// //         instanceUrl = parsed.instanceUrl;
// //       } catch (error) {
// //         console.error('Error parsing auth data:', error);
// //         setError('Error parsing Salesforce authentication data');
// //         setLoading(false);
// //         return;
// //       }
// //     }

// //     try {
// //       const response = await fetch('/api/reports', {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify({
// //           accessToken,
// //           instanceUrl,
// //           reportId,
// //           fetchReportData: true,
// //         }),
// //       });

// //       const data = await response.json();
      
// //       if (data.success) {
// //         setSelectedReport(reportId);
// //         setReportData(data.reportData);
// //         console.log('Fetched report data:', data.reportData);
// //       } else {
// //         throw new Error(data.error || 'Failed to fetch report data');
// //       }
// //     } catch (error) {
// //       console.error('Error fetching report data:', error);
// //       setError(error.message || 'Error fetching report data');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // Group reports by folder for display
// //   const reportsByFolder = {};
// //   reports.forEach(report => {
// //     if (!reportsByFolder[report.FolderName]) {
// //       reportsByFolder[report.FolderName] = [];
// //     }
// //     reportsByFolder[report.FolderName].push(report);
// //   });

// //   return (
// //     <div className="p-4">
// //       <h1 className="text-2xl font-bold mb-6">Salesforce Reports & Dashboards</h1>
      
// //       {error && (
// //         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
// //           {error}
// //         </div>
// //       )}
      
// //       {loading && !reports.length ? (
// //         <div className="flex justify-center items-center h-24">
// //           <p>Loading Salesforce data...</p>
// //         </div>
// //       ) : (
// //         <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
// //           {/* Reports List Section */}
// //           <div className="md:col-span-4 lg:col-span-3 border rounded shadow-sm">
// //             <div className="bg-gray-50 p-3 border-b">
// //               <h2 className="text-lg font-semibold">Reports ({reports.length})</h2>
// //             </div>
            
// //             <div className="p-3 max-h-[70vh] overflow-y-auto">
// //               {Object.keys(reportsByFolder).length === 0 ? (
// //                 <p className="text-gray-500">No reports found</p>
// //               ) : (
// //                 <div className="space-y-4">
// //                   {Object.entries(reportsByFolder).map(([folder, folderReports]) => (
// //                     <div key={folder} className="mb-3">
// //                       <h3 className="font-medium text-gray-700 bg-gray-100 p-2 rounded">{folder}</h3>
// //                       <ul className="mt-1">
// //                         {folderReports.map(report => (
// //                           <li 
// //                             key={report.Id} 
// //                             className={`cursor-pointer p-2 hover:bg-blue-50 border-b text-sm ${
// //                               selectedReport === report.Id ? 'bg-blue-100' : ''
// //                             }`}
// //                             onClick={() => fetchReportData(report.Id)}
// //                           >
// //                             {report.Name}
// //                             {report.Description && (
// //                               <p className="text-xs text-gray-500 mt-1">{report.Description}</p>
// //                             )}
// //                           </li>
// //                         ))}
// //                       </ul>
// //                     </div>
// //                   ))}
// //                 </div>
// //               )}
// //             </div>
// //           </div>
          
// //           {/* Report Data Section */}
// //           <div className="md:col-span-8 lg:col-span-9 border rounded shadow-sm">
// //             <div className="bg-gray-50 p-3 border-b">
// //               <h2 className="text-lg font-semibold">
// //                 {selectedReport 
// //                   ? reports.find(r => r.Id === selectedReport)?.Name || 'Report Details'
// //                   : 'Report Details'
// //                 }
// //               </h2>
// //             </div>
            
// //             <div className="p-4">
// //               {selectedReport ? (
// //                 loading ? (
// //                   <div className="flex justify-center items-center h-64">
// //                     <p>Loading report data...</p>
// //                   </div>
// //                 ) : reportData ? (
// //                   <div>
// //                     <div className="bg-gray-50 p-3 mb-4 rounded">
// //                       <p className="mb-2">
// //                         <span className="font-medium">Format:</span> {reportData.reportMetadata?.reportFormat || 'N/A'}
// //                       </p>
// //                       {reportData.reportMetadata?.reportType?.label && (
// //                         <p className="mb-2">
// //                           <span className="font-medium">Type:</span> {reportData.reportMetadata.reportType.label}
// //                         </p>
// //                       )}
// //                       <p>
// //                         <span className="font-medium">Description:</span> {reports.find(r => r.Id === selectedReport)?.Description || 'N/A'}
// //                       </p>
// //                     </div>
                    
// //                     {/* Report data display - handles different report formats */}
// //                     {reportData.factMap ? (
// //                       <div className="overflow-x-auto border rounded">
// //                         <table className="min-w-full divide-y divide-gray-200">
// //                           <thead className="bg-gray-50">
// //                             <tr>
// //                               {reportData.reportMetadata?.detailColumns?.map((column, i) => (
// //                                 <th 
// //                                   key={i} 
// //                                   className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
// //                                 >
// //                                   {column}
// //                                 </th>
// //                               ))}
// //                             </tr>
// //                           </thead>
// //                           <tbody className="bg-white divide-y divide-gray-200">
// //                             {reportData.factMap['T!T']?.rows?.map((row, i) => (
// //                               <tr key={i}>
// //                                 {row.dataCells.map((cell, j) => (
// //                                   <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
// //                                     {cell.label || cell.value || 'N/A'}
// //                                   </td>
// //                                 ))}
// //                               </tr>
// //                             ))}
// //                           </tbody>
// //                         </table>
// //                       </div>
// //                     ) : (
// //                       <div className="text-center py-8 text-gray-500">
// //                         <p>This report type doesn't contain standard tabular data</p>
// //                       </div>
// //                     )}
// //                   </div>
// //                 ) : (
// //                   <div className="text-center py-8 text-gray-500">
// //                     <p>Failed to load report data</p>
// //                   </div>
// //                 )
// //               ) : (
// //                 <div className="text-center py-8 text-gray-500">
// //                   <p>Select a report from the left panel to view details</p>
// //                 </div>
// //               )}
// //             </div>
// //           </div>
// //         </div>
// //       )}
      
// //       {/* Dashboards Section */}
// //       <div className="mt-8">
// //         <h2 className="text-xl font-semibold mb-4">Dashboards ({dashboards.length})</h2>
        
// //         {dashboards.length === 0 ? (
// //           <p className="text-gray-500">No dashboards found</p>
// //         ) : (
// //           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
// //             {dashboards.map(dashboard => (
// //               <div key={dashboard.Id} className="border rounded shadow-sm p-4 hover:shadow-md cursor-pointer">
// //                 <h3 className="font-medium">{dashboard.Title}</h3>
// //                 {dashboard.Description && (
// //                   <p className="text-sm text-gray-500 mt-1">{dashboard.Description}</p>
// //                 )}
// //                 <div className="text-xs text-gray-400 mt-2">
// //                   {dashboard.FolderName}
// //                 </div>
// //               </div>
// //             ))}
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default ReportsBuild;




// import React, { useState, useEffect } from 'react';
// import { useTheme } from 'next-themes';
// import { 
//   Search, RefreshCw, FileText, 
//   PieChart, AlertCircle, Loader2,
//   ChevronDown, ChevronUp, X
// } from 'lucide-react';

// const ReportsBuild = () => {
//   const { theme } = useTheme();
//   const [loading, setLoading] = useState(true);
//   const [reports, setReports] = useState([]);
//   const [dashboards, setDashboards] = useState([]);
//   const [selectedReport, setSelectedReport] = useState(null);
//   const [reportData, setReportData] = useState(null);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [expandedFolders, setExpandedFolders] = useState({});

//   // Fetch reports and dashboards on component mount
//   useEffect(() => {
//     fetchReports();
//   }, []);

//   const fetchReports = async () => {
//     setLoading(true);
//     setError(null);
    
//     // Get auth data from localStorage
//     let accessToken = null;
//     let instanceUrl = null;
    
//     const savedAuthData = localStorage.getItem('sfAuthData');
//     if (savedAuthData) {
//       try {
//         const parsed = JSON.parse(savedAuthData);
//         accessToken = parsed.accessToken;
//         instanceUrl = parsed.instanceUrl;
//       } catch (error) {
//         console.error('Error parsing auth data:', error);
//         setError('Error parsing Salesforce authentication data');
//         setLoading(false);
//         return;
//       }
//     } else {
//       console.error('Missing Salesforce credentials');
//       setError('No Salesforce authentication data found');
//       setLoading(false);
//       return;
//     }

//     try {
//       const response = await fetch('/api/reports', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           accessToken,
//           instanceUrl,
//           fetchReportData: false,
//         }),
//       });

//       const data = await response.json();
      
//       if (data.success) {
//         setReports(data.reports);
//         setDashboards(data.dashboards);
        
//         // Initialize all folders as expanded
//         const initialExpandedState = {};
//         data.reports.forEach(report => {
//           const folderName = report.FolderName || 'Unfiled Reports';
//           initialExpandedState[folderName] = true;
//         });
//         setExpandedFolders(initialExpandedState);
        
//         console.log('Fetched reports:', data);
//       } else {
//         throw new Error(data.error || 'Failed to fetch data from Salesforce');
//       }
//     } catch (error) {
//       console.error('Error fetching reports:', error);
//       setError(error.message || 'Error fetching Salesforce data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchReportData = async (reportId) => {
//     if (!reportId) return;
    
//     setLoading(true);
//     setError(null);
    
//     // Get auth data from localStorage
//     let accessToken = null;
//     let instanceUrl = null;
    
//     const savedAuthData = localStorage.getItem('sfAuthData');
//     if (savedAuthData) {
//       try {
//         const parsed = JSON.parse(savedAuthData);
//         accessToken = parsed.accessToken;
//         instanceUrl = parsed.instanceUrl;
//       } catch (error) {
//         console.error('Error parsing auth data:', error);
//         setError('Error parsing Salesforce authentication data');
//         setLoading(false);
//         return;
//       }
//     }

//     try {
//       const response = await fetch('/api/reports', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           accessToken,
//           instanceUrl,
//           reportId,
//           fetchReportData: true,
//         }),
//       });

//       const data = await response.json();
      
//       if (data.success) {
//         setSelectedReport(reportId);
//         setReportData(data.reportData);
//         console.log('Fetched report data:', data.reportData);
//       } else {
//         // Handle specific error cases
//         if (data.statusCode === 403) {
//           throw new Error('You do not have permission to access this report. Please check your Salesforce permissions.');
//         } else {
//           throw new Error(data.error || 'Failed to fetch report data');
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching report data:', error);
//       setError(error.message || 'Error fetching report data');
//       // Don't reset selected report on error
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Toggle folder expansion
//   const toggleFolder = (folderName) => {
//     setExpandedFolders(prev => ({
//       ...prev,
//       [folderName]: !prev[folderName]
//     }));
//   };

//   // Filter reports by search term
//   const filteredReports = reports.filter(report => 
//     report.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     (report.Description && report.Description.toLowerCase().includes(searchTerm.toLowerCase()))
//   );

//   // Group reports by folder for display
//   const reportsByFolder = {};
//   filteredReports.forEach(report => {
//     const folderName = report.FolderName || 'Unfiled Reports';
//     if (!reportsByFolder[folderName]) {
//       reportsByFolder[folderName] = [];
//     }
//     reportsByFolder[folderName].push(report);
//   });

//   // Helper to safely check if a value is an array
//   const isArray = (value) => Array.isArray(value);

//   // Helper to render report data based on format
//   const renderReportData = () => {
//     if (!reportData) return null;

//     const reportFormat = reportData.reportMetadata?.reportFormat;
    
//     // Handle different report formats
//     switch (reportFormat) {
//       case 'TABULAR':
//         return renderTabularReport();
//       case 'SUMMARY':
//         return renderSummaryReport();
//       case 'MATRIX':
//         return renderMatrixReport();
//       default:
//         return (
//           <div className="text-center py-8 text-gray-500">
//             <p>This report format ({reportFormat || 'Unknown'}) doesn't have a specialized renderer</p>
//           </div>
//         );
//     }
//   };

//   // Render a tabular report
//   const renderTabularReport = () => {
//     if (!reportData.factMap || !reportData.factMap['T!T']) {
//       return (
//         <div className="text-center py-8 text-gray-500">
//           <p>No data available for this report</p>
//         </div>
//       );
//     }

//     const detailColumns = reportData.reportMetadata?.detailColumns || [];
//     const rows = reportData.factMap['T!T']?.rows || [];
//     const aggregates = reportData.factMap['T!T']?.aggregates || [];

//     return (
//       <div className="overflow-x-auto border rounded">
//         <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
//           <thead className="bg-gray-50 dark:bg-gray-800">
//             <tr>
//               {detailColumns.map((column, i) => {
//                 // Find the label for this column
//                 const columnLabel = reportData.reportExtendedMetadata?.detailColumnInfo?.[column]?.label || column;
//                 return (
//                   <th 
//                     key={i} 
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
//                   >
//                     {columnLabel}
//                   </th>
//                 );
//               })}
//             </tr>
//           </thead>
//           <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
//             {rows.map((row, i) => (
//               <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
//                 {row.dataCells.map((cell, j) => (
//                   <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
//                     {cell.label || (cell.value !== undefined ? cell.value.toString() : 'N/A')}
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//           {aggregates.length > 0 && (
//             <tfoot className="bg-gray-100 dark:bg-gray-800">
//               <tr>
//                 {aggregates.map((agg, i) => (
//                   <td key={i} className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
//                     {agg.label || (agg.value !== undefined ? agg.value.toString() : 'N/A')}
//                   </td>
//                 ))}
//               </tr>
//             </tfoot>
//           )}
//         </table>
//       </div>
//     );
//   };

//   // Render a summary report
//   const renderSummaryReport = () => {
//     // Safety check - ensure groupingsDown is an array
//     if (!reportData.groupingsDown || !isArray(reportData.groupingsDown) || !reportData.factMap) {
//       return (
//         <div className="text-center py-8 text-gray-500">
//           <p>No data available for this summary report</p>
//         </div>
//       );
//     }

//     return (
//       <div className="overflow-x-auto border rounded">
//         <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
//           <thead className="bg-gray-50 dark:bg-gray-800">
//             <tr>
//               {/* Group column */}
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                 {reportData.reportExtendedMetadata?.groupingColumnInfo?.[reportData.reportMetadata?.groupingsDown?.[0]?.name]?.label || 'Group'}
//               </th>
              
//               {/* Data columns */}
//               {(reportData.reportMetadata?.detailColumns || []).map((column, i) => {
//                 const columnLabel = reportData.reportExtendedMetadata?.detailColumnInfo?.[column]?.label || column;
//                 return (
//                   <th 
//                     key={i} 
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
//                   >
//                     {columnLabel}
//                   </th>
//                 );
//               })}
//             </tr>
//           </thead>
//           <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
//             {reportData.groupingsDown.map((group, groupIdx) => {
//               const groupKey = `${groupIdx}!T`;
//               const groupData = reportData.factMap[groupKey];
              
//               return (
//                 <React.Fragment key={groupIdx}>
//                   {/* Group header */}
//                   <tr className="bg-gray-100 dark:bg-gray-800">
//                     <td 
//                       colSpan={(reportData.reportMetadata?.detailColumns || []).length + 1}
//                       className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300"
//                     >
//                       {group.label}: {groupData?.aggregates?.[0]?.label || 'N/A'}
//                     </td>
//                   </tr>
                  
//                   {/* Group rows */}
//                   {(groupData?.rows || []).map((row, rowIdx) => (
//                     <tr key={`${groupIdx}-${rowIdx}`} className={rowIdx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
//                       {/* Empty cell for group column */}
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"></td>
                      
//                       {/* Data cells */}
//                       {row.dataCells.map((cell, cellIdx) => (
//                         <td key={cellIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
//                           {cell.label || (cell.value !== undefined ? cell.value.toString() : 'N/A')}
//                         </td>
//                       ))}
//                     </tr>
//                   ))}
//                 </React.Fragment>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//     );
//   };

//   // Render a matrix report
//   const renderMatrixReport = () => {
//     // Safety check - ensure groupingsDown and groupingsAcross are arrays
//     if (!reportData.groupingsDown || !isArray(reportData.groupingsDown) || 
//         !reportData.groupingsAcross || !isArray(reportData.groupingsAcross) || 
//         !reportData.factMap) {
//       return (
//         <div className="text-center py-8 text-gray-500">
//           <p>No data available for this matrix report</p>
//         </div>
//       );
//     }

//     return (
//       <div className="overflow-x-auto border rounded">
//         <div className="p-4 text-center">
//           <h3 className="text-lg font-medium dark:text-white">Matrix Report</h3>
//           <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
//             Matrix reports display data in a grid format with row and column groupings.
//             Please note that this is a simplified representation of the actual matrix report in Salesforce.
//           </p>
//         </div>
        
//         <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
//           <thead className="bg-gray-50 dark:bg-gray-800">
//             <tr>
//               {/* Empty corner cell */}
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                 {reportData.reportExtendedMetadata?.groupingColumnInfo?.[reportData.reportMetadata?.groupingsDown?.[0]?.name]?.label || 'Rows'}
//               </th>
              
//               {/* Column headers */}
//               {reportData.groupingsAcross.map((group, i) => (
//                 <th 
//                   key={i} 
//                   className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
//                 >
//                   {group.label}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
//             {reportData.groupingsDown.map((rowGroup, rowIdx) => {
//               return (
//                 <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
//                   {/* Row header */}
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">
//                     {rowGroup.label}
//                   </td>
                  
//                   {/* Cells */}
//                   {reportData.groupingsAcross.map((colGroup, colIdx) => {
//                     const factMapKey = `${rowIdx}!${colIdx}`;
//                     const cellData = reportData.factMap[factMapKey];
                    
//                     return (
//                       <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
//                         {cellData?.aggregates?.[0]?.label || 'N/A'}
//                       </td>
//                     );
//                   })}
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//     );
//   };

//   // Render report metadata
//   const renderReportMetadata = () => {
//     if (!reportData || !reportData.reportMetadata) return null;
    
//     return (
//       <div className="bg-gray-50 dark:bg-gray-800 p-4 mb-4 rounded border border-gray-200 dark:border-gray-700">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <p className="mb-2 flex items-center">
//               <span className="font-medium mr-2 dark:text-gray-300">Format:</span> 
//               <span className="text-gray-700 dark:text-gray-400">{reportData.reportMetadata?.reportFormat || 'N/A'}</span>
//             </p>
//             {reportData.reportMetadata?.reportType?.label && (
//               <p className="mb-2 flex items-center">
//                 <span className="font-medium mr-2 dark:text-gray-300">Type:</span> 
//                 <span className="text-gray-700 dark:text-gray-400">{reportData.reportMetadata.reportType.label}</span>
//               </p>
//             )}
//           </div>
//           <div>
//             <p className="mb-2 flex items-center">
//               <span className="font-medium mr-2 dark:text-gray-300">Description:</span> 
//               <span className="text-gray-700 dark:text-gray-400">{reports.find(r => r.Id === selectedReport)?.Description || 'N/A'}</span>
//             </p>
//             {reportData.attributes?.totalSize !== undefined && (
//               <p className="flex items-center">
//                 <span className="font-medium mr-2 dark:text-gray-300">Total Records:</span> 
//                 <span className="text-gray-700 dark:text-gray-400">{reportData.attributes.totalSize}</span>
//               </p>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="p-4 dark:bg-gray-950 min-h-screen">
//       <h1 className="text-2xl font-bold mb-6 dark:text-white flex items-center">
//         <FileText className="mr-2" /> Salesforce Reports & Dashboards
//       </h1>
      
//       {error && (
//         <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4 flex items-center justify-between">
//           <div className="flex items-center">
//             <AlertCircle className="h-5 w-5 mr-2" />
//             <span>{error}</span>
//           </div>
//           <button 
//             className="text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 rounded-full p-1"
//             onClick={() => setError(null)}
//           >
//             <X className="h-5 w-5" />
//           </button>
//         </div>
//       )}
      
//       {loading && !reports.length ? (
//         <div className="flex justify-center items-center h-64">
//           <div className="flex flex-col items-center">
//             <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
//             <p className="mt-4 text-gray-600 dark:text-gray-400">Loading Salesforce data...</p>
//           </div>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
//           {/* Reports List Section */}
//           <div className="md:col-span-4 lg:col-span-3 border rounded-lg shadow-sm dark:border-gray-700 bg-white dark:bg-gray-900">
//             <div className="bg-gray-50 dark:bg-gray-800 p-4 border-b dark:border-gray-700 rounded-t-lg">
//               <h2 className="text-lg font-semibold dark:text-white flex items-center">
//                 <FileText className="h-5 w-5 mr-2" /> Reports ({reports.length})
//               </h2>
              
//               {/* Search input */}
//               <div className="mt-3 relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Search className="h-4 w-4 text-gray-400" />
//                 </div>
//                 <input
//                   type="text"
//                   placeholder="Search reports..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
              
//               {/* Refresh button */}
//               <button
//                 onClick={fetchReports}
//                 className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm flex items-center justify-center transition-colors"
//               >
//                 <RefreshCw className="h-4 w-4 mr-2" />
//                 Refresh Reports
//               </button>
//             </div>
            
//             <div className="p-1 max-h-[70vh] overflow-y-auto">
//               {Object.keys(reportsByFolder).length === 0 ? (
//                 <div className="text-gray-500 dark:text-gray-400 p-4 text-center">
//                   {searchTerm ? 'No matching reports found' : 'No reports found'}
//                 </div>
//               ) : (
//                 <div className="space-y-1">
//                   {Object.entries(reportsByFolder).map(([folder, folderReports]) => (
//                     <div key={folder} className="mb-1">
//                       <div 
//                         className="font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 p-3 rounded-md flex items-center justify-between cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
//                         onClick={() => toggleFolder(folder)}
//                       >
//                         <span>{folder} ({folderReports.length})</span>
//                         {expandedFolders[folder] ? (
//                           <ChevronUp className="h-4 w-4" />
//                         ) : (
//                           <ChevronDown className="h-4 w-4" />
//                         )}
//                       </div>
                      
//                       {expandedFolders[folder] && (
//                         <ul className="mt-1">
//                           {folderReports.map(report => (
//                             <li 
//                               key={report.Id} 
//                               className={`cursor-pointer p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-b dark:border-gray-700 text-sm ${
//                                 selectedReport === report.Id ? 'bg-blue-100 dark:bg-blue-900/30' : ''
//                               }`}
//                               onClick={() => fetchReportData(report.Id)}
//                             >
//                               <div className="font-medium text-gray-800 dark:text-gray-200">{report.Name}</div>
//                               {report.Description && (
//                                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{report.Description}</p>
//                               )}
//                             </li>
//                           ))}
//                         </ul>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
          
//           {/* Report Data Section */}
//           <div className="md:col-span-8 lg:col-span-9 border rounded-lg shadow-sm dark:border-gray-700 bg-white dark:bg-gray-900">
//             <div className="bg-gray-50 dark:bg-gray-800 p-4 border-b dark:border-gray-700 rounded-t-lg">
//               <h2 className="text-lg font-semibold dark:text-white">
//                 {selectedReport 
//                   ? reports.find(r => r.Id === selectedReport)?.Name || 'Report Details'
//                   : 'Report Details'
//                 }
//               </h2>
//             </div>
            
//             <div className="p-4">
//               {selectedReport ? (
//                 loading ? (
//                   <div className="flex justify-center items-center h-64">
//                     <div className="flex flex-col items-center">
//                       <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
//                       <p className="mt-4 text-gray-600 dark:text-gray-400">Loading report data...</p>
//                     </div>
//                   </div>
//                 ) : reportData ? (
//                   <div>
//                     {renderReportMetadata()}
//                     {renderReportData()}
//                   </div>
//                 ) : (
//                   <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6">
//                     <AlertCircle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
//                     <p className="text-lg font-medium mb-4">Failed to load report data</p>
//                     <p className="mb-6">You may not have sufficient permissions to view this report.</p>
//                     <button
//                       onClick={() => fetchReportData(selectedReport)}
//                       className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors inline-flex items-center"
//                     >
//                       <RefreshCw className="h-4 w-4 mr-2" />
//                       Try Again
//                     </button>
//                   </div>
//                 )
//               ) : (
//                 <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-8">
//                   <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
//                   <p className="text-lg">Select a report from the left panel to view details</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
      
//       {/* Dashboards Section */}
//       <div className="mt-8">
//         <h2 className="text-xl font-semibold mb-4 dark:text-white flex items-center">
//           <PieChart className="mr-2" /> Dashboards ({dashboards.length})
//         </h2>
        
//         {dashboards.length === 0 ? (
//           <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
//             <p>No dashboards found</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//             {dashboards.map(dashboard => (
//               <div 
//                 key={dashboard.Id} 
//                 className="border rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-gray-900 dark:border-gray-700"
//               >
//                 <h3 className="font-medium dark:text-white">{dashboard.Title}</h3>
//                 {dashboard.Description && (
//                   <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{dashboard.Description}</p>
//                 )}
//                 <div className="text-xs text-gray-400 dark:text-gray-500 mt-2 flex items-center">
//                   <PieChart className="h-3 w-3 mr-1" />
//                   {dashboard.FolderName}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ReportsBuild;





import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { 
  Search, RefreshCw, FileText, 
  PieChart, BarChart3, Table, 
  AlertCircle, Loader2,
  ChevronDown, ChevronUp, X, Download
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, 
  PieChart as RechartsPI, Pie, Cell
} from 'recharts';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';

// COLORS for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

const ReportsBuild = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [dashboards, setDashboards] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFolders, setExpandedFolders] = useState({});
  const [activeTab, setActiveTab] = useState('bar');

  // Fetch reports and dashboards on component mount
  useEffect(() => {
    fetchReports();
  }, []);

  // Process report data for visualization when it changes
  useEffect(() => {
    if (reportData) {
      processReportDataForCharts();
    }
  }, [reportData]);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    
    // Get auth data from localStorage
    let accessToken = null;
    let instanceUrl = null;
    
    const savedAuthData = localStorage.getItem('sfAuthData');
    if (savedAuthData) {
      try {
        const parsed = JSON.parse(savedAuthData);
        accessToken = parsed.accessToken;
        instanceUrl = parsed.instanceUrl;
      } catch (error) {
        console.error('Error parsing auth data:', error);
        setError('Error parsing Salesforce authentication data');
        setLoading(false);
        return;
      }
    } else {
      console.error('Missing Salesforce credentials');
      setError('No Salesforce authentication data found');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken,
          instanceUrl,
          fetchReportData: false,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setReports(data.reports);
        setDashboards(data.dashboards);
        
        // Initialize all folders as expanded
        const initialExpandedState = {};
        data.reports.forEach(report => {
          const folderName = report.FolderName || 'Unfiled Reports';
          initialExpandedState[folderName] = true;
        });
        setExpandedFolders(initialExpandedState);
      } else {
        throw new Error(data.error || 'Failed to fetch data from Salesforce');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError(error.message || 'Error fetching Salesforce data');
    } finally {
      setLoading(false);
    }
  };

  const fetchReportData = async (reportId) => {
    if (!reportId) return;
    
    setLoading(true);
    setError(null);
    
    // Get auth data from localStorage
    let accessToken = null;
    let instanceUrl = null;
    
    const savedAuthData = localStorage.getItem('sfAuthData');
    if (savedAuthData) {
      try {
        const parsed = JSON.parse(savedAuthData);
        accessToken = parsed.accessToken;
        instanceUrl = parsed.instanceUrl;
      } catch (error) {
        console.error('Error parsing auth data:', error);
        setError('Error parsing Salesforce authentication data');
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken,
          instanceUrl,
          reportId,
          fetchReportData: true,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSelectedReport(reportId);
        setReportData(data.reportData);
        setActiveTab('bar'); // Default to bar chart when a new report is loaded
      } else {
        // Handle specific error cases
        if (data.statusCode === 403) {
          throw new Error('You do not have permission to access this report. Please check your Salesforce permissions.');
        } else {
          throw new Error(data.error || 'Failed to fetch report data');
        }
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      setError(error.message || 'Error fetching report data');
    } finally {
      setLoading(false);
    }
  };

  // Process report data for visualization
  const processReportDataForCharts = () => {
    if (!reportData) return;
    
    const reportFormat = reportData.reportMetadata?.reportFormat;
    let chartData = [];
    
    try {
      switch (reportFormat) {
        case 'TABULAR':
          // For tabular reports, we'll use the first two columns for visualization
          if (reportData.factMap && reportData.factMap['T!T'] && reportData.factMap['T!T'].rows) {
            const rows = reportData.factMap['T!T'].rows;
            const columns = reportData.reportMetadata?.detailColumns || [];
            
            // Only process if we have at least 2 columns (one for label, one for value)
            if (columns.length >= 2) {
              chartData = rows.map(row => {
                const item = {};
                // First column as name
                item.name = row.dataCells[0].label || row.dataCells[0].value?.toString() || 'N/A';
                
                // Additional columns as values
                columns.forEach((column, index) => {
                  if (index > 0 && row.dataCells[index]) {
                    const value = parseFloat(row.dataCells[index].value);
                    const columnName = reportData.reportExtendedMetadata?.detailColumnInfo[column]?.label || column;
                    item[columnName] = isNaN(value) ? 0 : value;
                  }
                });
                
                return item;
              });
            }
          }
          break;
          
        case 'SUMMARY':
          // For summary reports, we'll use the group labels and their aggregates
          if (reportData.groupingsDown && reportData.groupingsDown.length > 0) {
            chartData = reportData.groupingsDown.map((group, index) => {
              const groupKey = `${index}!T`;
              const groupData = reportData.factMap[groupKey];
              
              // Try to get numeric value from aggregate
              let value = 0;
              if (groupData && groupData.aggregates && groupData.aggregates.length > 0) {
                const rawValue = groupData.aggregates[0].value;
                value = parseFloat(rawValue);
                if (isNaN(value)) value = 0;
              }
              
              return {
                name: group.label,
                value: value
              };
            });
          }
          break;
          
        case 'MATRIX':
          // For matrix reports, we'll use the row groupings and first column data
          if (reportData.groupingsDown && reportData.groupingsAcross) {
            chartData = reportData.groupingsDown.map((rowGroup, rowIdx) => {
              const item = { name: rowGroup.label };
              
              reportData.groupingsAcross.forEach((colGroup, colIdx) => {
                const factMapKey = `${rowIdx}!${colIdx}`;
                const cellData = reportData.factMap[factMapKey];
                
                if (cellData && cellData.aggregates && cellData.aggregates.length > 0) {
                  const value = parseFloat(cellData.aggregates[0].value);
                  item[colGroup.label] = isNaN(value) ? 0 : value;
                } else {
                  item[colGroup.label] = 0;
                }
              });
              
              return item;
            });
          }
          break;
          
        default:
          // Default fallback for unknown formats
          chartData = [];
      }
    } catch (error) {
      console.error('Error processing chart data:', error);
      chartData = [];
    }
    
    setChartData(chartData);
  };

  // Toggle folder expansion
  const toggleFolder = (folderName) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  // Filter reports by search term
  const filteredReports = reports.filter(report => 
    report.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (report.Description && report.Description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group reports by folder for display
  const reportsByFolder = {};
  filteredReports.forEach(report => {
    const folderName = report.FolderName || 'Unfiled Reports';
    if (!reportsByFolder[folderName]) {
      reportsByFolder[folderName] = [];
    }
    reportsByFolder[folderName].push(report);
  });

  // Helper to get chart keys (for bar chart series)
  const getChartKeys = () => {
    if (chartData.length === 0) return [];
    
    // Get all keys except 'name'
    const allKeys = Object.keys(chartData[0]).filter(key => key !== 'name');
    
    // Limit to 5 keys to avoid overcrowding
    return allKeys.slice(0, 5);
  };
  
  // Render the bar chart
  const renderBarChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No data available for visualization</p>
        </div>
      );
    }
    
    const keys = getChartKeys();
    
    return (
      <div className="w-full h-96 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={70} 
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            {keys.map((key, index) => (
              <Bar 
                key={index}
                dataKey={key} 
                fill={COLORS[index % COLORS.length]} 
                name={key} 
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // Render the pie chart
  const renderPieChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No data available for visualization</p>
        </div>
      );
    }
    
    // For pie chart, we need a simple name/value structure
    // If data has multiple value columns, we'll use the first one
    const keys = getChartKeys();
    const firstValueKey = keys[0];
    
    // If we don't have a value key, we can't show a pie chart
    if (!firstValueKey) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No numeric data available for pie chart</p>
        </div>
      );
    }
    
    // Process data for pie chart
    const pieData = chartData.map(item => ({
      name: item.name,
      value: item[firstValueKey]
    }));
    
    return (
      <div className="w-full h-96 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPI>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => value.toLocaleString()} />
            <Legend />
          </RechartsPI>
        </ResponsiveContainer>
      </div>
    );
  };

  // Render the tabular report with enhanced styling
  const renderTabularView = () => {
    if (!reportData || !reportData.factMap || !reportData.factMap['T!T']) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No data available for table view</p>
        </div>
      );
    }

    const detailColumns = reportData.reportMetadata?.detailColumns || [];
    const rows = reportData.factMap['T!T']?.rows || [];
    const aggregates = reportData.factMap['T!T']?.aggregates || [];

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              {detailColumns.map((column, i) => {
                // Find the label for this column
                const columnLabel = reportData.reportExtendedMetadata?.detailColumnInfo?.[column]?.label || column;
                return (
                  <th 
                    key={i} 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b dark:border-gray-700"
                  >
                    {columnLabel}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                {row.dataCells.map((cell, j) => (
                  <td key={j} className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">
                    {cell.label || (cell.value !== undefined ? cell.value.toString() : 'N/A')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {aggregates.length > 0 && (
            <tfoot className="bg-gray-100 dark:bg-gray-800 font-medium">
              <tr>
                {aggregates.map((agg, i) => (
                  <td key={i} className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border-t dark:border-gray-600">
                    {agg.label || (agg.value !== undefined ? agg.value.toString() : 'N/A')}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    );
  };

  return (
    <div className="p-4 dark:bg-gray-950 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 dark:text-white flex items-center">
        <FileText className="mr-2" /> Salesforce Reports Visualization
      </h1>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-2"
            onClick={() => setError(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      )}
      
      {loading && !reports.length ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading Salesforce data...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Reports List Section */}
          <div className="md:col-span-4 lg:col-span-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-5 w-5 mr-2" /> Reports ({reports.length})
                </CardTitle>
                <CardDescription>Select a report to visualize</CardDescription>
                
                <div className="relative mt-2">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <Button
                  onClick={fetchReports}
                  className="w-full mt-2"
                  variant="secondary"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Reports
                </Button>
              </CardHeader>
              
              <CardContent className="max-h-[65vh] overflow-y-auto p-1">
                {Object.keys(reportsByFolder).length === 0 ? (
                  <div className="text-gray-500 dark:text-gray-400 p-4 text-center">
                    {searchTerm ? 'No matching reports found' : 'No reports found'}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {Object.entries(reportsByFolder).map(([folder, folderReports]) => (
                      <div key={folder} className="mb-1">
                        <div 
                          className="font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 p-3 rounded-md flex items-center justify-between cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                          onClick={() => toggleFolder(folder)}
                        >
                          <span>{folder} ({folderReports.length})</span>
                          {expandedFolders[folder] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                        
                        {expandedFolders[folder] && (
                          <ul className="mt-1">
                            {folderReports.map(report => (
                              <li 
                                key={report.Id} 
                                className={`cursor-pointer p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-b dark:border-gray-700 text-sm ${
                                  selectedReport === report.Id ? 'bg-blue-100 dark:bg-blue-900/30' : ''
                                }`}
                                onClick={() => fetchReportData(report.Id)}
                              >
                                <div className="font-medium text-gray-800 dark:text-gray-200">{report.Name}</div>
                                {report.Description && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{report.Description}</p>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Report Data Section */}
          <div className="md:col-span-8 lg:col-span-9">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    {selectedReport 
                      ? reports.find(r => r.Id === selectedReport)?.Name || 'Report Details'
                      : 'Report Details'
                    }
                  </CardTitle>
                  
                  {reportData && !loading && (
                    <Badge variant="outline" className="ml-2">
                      {reportData.reportMetadata?.reportFormat || 'Unknown'} Report
                    </Badge>
                  )}
                </div>
                
                {reportData && !loading && (
                  <CardDescription>
                    {reports.find(r => r.Id === selectedReport)?.Description || 'No description available'}
                  </CardDescription>
                )}
              </CardHeader>
              
              <CardContent>
                {selectedReport ? (
                  loading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="flex flex-col items-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading report data...</p>
                      </div>
                    </div>
                  ) : reportData ? (
                    <div>
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
                        <TabsList className="grid grid-cols-3 mb-4">
                          <TabsTrigger value="bar" className="flex items-center">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Bar Chart
                          </TabsTrigger>
                          <TabsTrigger value="pie" className="flex items-center">
                            <PieChart className="h-4 w-4 mr-2" />
                            Pie Chart
                          </TabsTrigger>
                          <TabsTrigger value="table" className="flex items-center">
                            <Table className="h-4 w-4 mr-2" />
                            Table View
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="bar" className="mt-0">
                          {renderBarChart()}
                        </TabsContent>
                        
                        <TabsContent value="pie" className="mt-0">
                          {renderPieChart()}
                        </TabsContent>
                        
                        <TabsContent value="table" className="mt-0">
                          {renderTabularView()}
                        </TabsContent>
                      </Tabs>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                      <AlertCircle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
                      <p className="text-lg font-medium mb-4">Failed to load report data</p>
                      <p className="mb-6">You may not have sufficient permissions to view this report.</p>
                      <Button
                        onClick={() => fetchReportData(selectedReport)}
                        variant="default"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                      </Button>
                    </div>
                  )
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg">Select a report from the left panel to view details</p>
                  </div>
                )}
              </CardContent>
              
              {reportData && !loading && (
                <CardFooter className="pt-0 flex justify-end">
                  <Button variant="outline" className="flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      )}
      
      {/* Dashboards Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 dark:text-white flex items-center">
          <PieChart className="mr-2" /> Dashboards ({dashboards.length})
        </h2>
        
        {dashboards.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p>No dashboards found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {dashboards.map(dashboard => (
              <Card key={dashboard.Id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{dashboard.Title}</CardTitle>
                  {dashboard.Description && (
                    <CardDescription className="text-xs mt-1">
                      {dashboard.Description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardFooter className="pt-2 text-xs text-gray-400 dark:text-gray-500 flex items-center">
                  <PieChart className="h-3 w-3 mr-1" />
                  {dashboard.FolderName}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsBuild;