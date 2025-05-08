// src/app/api/salesforce/query/route.js
import { NextResponse } from 'next/server';
import jsforce from 'jsforce';

export async function POST(request) {
  try {
    const { accessToken, instanceUrl, query } = await request.json();
    console.log("request reach here");
    if (!accessToken || !instanceUrl || !query) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Initialize connection with the provided credentials
    const conn = new jsforce.Connection({
      instanceUrl,
      accessToken,
    });

    // Execute the query
    const result = await conn.query(query);
    
    return NextResponse.json({ success: true, records: result.records });
  } catch (error) {
    console.error('Salesforce query error:', error);

    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
