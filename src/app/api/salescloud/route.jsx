const { NextResponse } = require('next/server');
const jsforce = require('jsforce');

async function POST(request) {
  try {
    const { accessToken, instanceUrl, query, queryOptions } = await request.json();
    
    if (!accessToken || !instanceUrl || !query) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const conn = new jsforce.Connection({
      instanceUrl,
      accessToken,
    });

    let result;
    
    if (queryOptions?.type === 'single') {
      result = await conn.sobject(queryOptions.objectType).retrieve(queryOptions.id);
    } else {
      result = await conn.query(query);
    }

    return NextResponse.json({ 
      success: true, 
      records: Array.isArray(result) ? result : result.records || [result]
    });
  } catch (error) {
    console.error('Salesforce query error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}

module.exports = { POST };