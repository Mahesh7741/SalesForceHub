// // src\app\api\reports\route.jsx
// import { NextResponse } from 'next/server';
// import jsforce from 'jsforce';

// export async function POST(request) {
//   try {
//     const body = await request.json();
//     const { accessToken, instanceUrl, reportId, fetchReportData = false } = body;

//     if (!accessToken || !instanceUrl) {
//       return NextResponse.json(
//         { error: 'Missing required parameters' },
//         { status: 400 }
//       );
//     }

//     const conn = new jsforce.Connection({ accessToken, instanceUrl });

//     // Fetch Reports List
//     let reports = [];
//     try {
//       const reportsResult = await conn.query(
//         'SELECT Id, Name, DeveloperName, FolderName, Description, Format, LastRunDate FROM Report'
//       );
//       reports = reportsResult.records;
//     } catch (err) {
//       console.error('Failed to fetch reports:', err);
//     }

//     // Fetch Dashboards List
//     let dashboards = [];
//     try {
//       const dashboardsResult = await conn.query(
//         'SELECT Id, Title, FolderName, Description, LastViewedDate FROM Dashboard'
//       );
//       dashboards = dashboardsResult.records;
//     } catch (err) {
//       console.error('Failed to fetch dashboards:', err);
//     }

//     // Optionally fetch report data
//     let reportData = null;
//     if (fetchReportData && reportId) {
//       try {
//         const result = await conn.analytics.report(reportId).execute({ details: true });
//         reportData = result;
//       } catch (err) {
//         console.error('Failed to fetch report data:', err);
//         return NextResponse.json(
//           { error: `Failed to fetch report data for ${reportId}` },
//           { status: 500 }
//         );
//       }
//     }

//     return NextResponse.json({
//       success: true,
//       reports,
//       dashboards,
//       reportData,
//     });

//   } catch (err) {
//     console.error('Unexpected error:', err);
//     return NextResponse.json(
//       { error: err instanceof Error ? err.message : 'Unexpected server error' },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from 'next/server';
import jsforce from 'jsforce';

export async function POST(request) {
  try {
    const body = await request.json();
    const { accessToken, instanceUrl, reportId, fetchReportData = false } = body;
    // console.log("accessToken", accessToken)
    if (!accessToken || !instanceUrl) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    const conn = new jsforce.Connection({ accessToken, instanceUrl });
    
    // Fetch Reports List
    let reports = [];
    try {
      const reportsResult = await conn.query(
        'SELECT Id, Name, DeveloperName, FolderName, Description, Format, LastRunDate FROM Report'
      );
      reports = reportsResult.records;
      // console.log(reports)
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    }
    
    // Fetch Dashboards List
    let dashboards = [];
    try {
      const dashboardsResult = await conn.query(
        'SELECT Id, Title, FolderName, Description, LastViewedDate FROM Dashboard'
      );
      dashboards = dashboardsResult.records;
    } catch (err) {
      console.error('Failed to fetch dashboards:', err);
    }
    
    // Optionally fetch report data
    let reportData = null;
    if (fetchReportData && reportId) {
      try {
        // Use the REST API approach which might have better compatibility with permissions
        const reportUrl = `${instanceUrl}/services/data/v50.0/analytics/reports/${reportId}`;
        
        const response = await fetch(reportUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Response:', response);
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        reportData = await response.json();
      } catch (err) {
        console.error('Failed to fetch report data:', err);
        // Don't return error response here, just pass null reportData
        // so the frontend can still display reports list
      }
    }
    
    return NextResponse.json({
      success: true,
      reports,
      dashboards,
      reportData,
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unexpected server error' },
      { status: 500 }
    );
  }
}