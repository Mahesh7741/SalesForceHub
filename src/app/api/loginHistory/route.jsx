// import jsforce from 'jsforce';

// /**
//  * Fetch login history records from Salesforce
//  * @param {string} instanceUrl 
//  * @param {string} accessToken 
//  * @returns {Promise<Array>} Login history records
//  */
// export const fetchLoginHistory = async (instanceUrl, accessToken, limit = 10) => {
//   const conn = new jsforce.Connection({ instanceUrl, accessToken });

//   const query = `
//     SELECT Id, UserId, LoginTime, SourceIp, LoginType, Status, Browser, LoginUrl
//     FROM LoginHistory
//     WHERE LoginTime >= 2023-01-01T00:00:00Z
//     ORDER BY LoginTime DESC
//     LIMIT ${limit}
//   `;

//   return conn.query(query).then(res => res.records);
// };


// src/app/api/salesforce-proxy/route.js
import jsforce from 'jsforce';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // Parse the request body
    const body = await req.json();
    const { instanceUrl, accessToken, query, limit = 100 } = body;

    // Validate required parameters
    if (!instanceUrl || !accessToken) {
      return NextResponse.json(
        { error: 'Missing required parameters: instanceUrl and accessToken are required' },
        { status: 400 }
      );
    }

    // Initialize Salesforce connection
    const conn = new jsforce.Connection({
      instanceUrl,
      accessToken
    });

    // Use the provided query if available, otherwise build a default query
    const soqlQuery = query || `
      SELECT Id, UserId, LoginTime, SourceIp, LoginType, Status, Browser, LoginUrl,
             Application, Platform, ApiType, ApiVersion
      FROM LoginHistory
      WHERE LoginTime >= LAST_N_DAYS:30
      ORDER BY LoginTime DESC
      LIMIT ${limit}
    `;

    // Execute the query
    console.log('Executing SOQL query:', soqlQuery);
    const result = await conn.query(soqlQuery);

    // Return the results
    return NextResponse.json({
      success: true,
      records: result.records,
      totalSize: result.totalSize,
      done: result.done
    });
  } catch (error) {
    console.error('Salesforce API error:', error);
    
    // Handle different types of errors
    let statusCode = 500;
    let errorMessage = 'Internal server error';
    
    if (error.name === 'invalid_grant') {
      statusCode = 401;
      errorMessage = 'Authentication failed: Invalid or expired Salesforce access token';
    } else if (error.name === 'INVALID_SESSION_ID') {
      statusCode = 401;
      errorMessage = 'Authentication failed: Invalid Salesforce session';
    } else if (error.errorCode) {
      errorMessage = `Salesforce API error: ${error.errorCode} - ${error.message}`;
    } else {
      errorMessage = error.message || 'Unknown error occurred';
    }
    
    return NextResponse.json(
      { error: errorMessage, details: error.errorCode ? error : undefined },
      { status: statusCode }
    );
  }
}