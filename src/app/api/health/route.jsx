import { NextResponse } from 'next/server';
import jsforce from 'jsforce';

export async function POST(request) {
  try {
    const { accessToken, instanceUrl } = await request.json();
    console.log("accessToken", accessToken);
    console.log("instanceUrl", instanceUrl);

    if (!accessToken || !instanceUrl) {
      return NextResponse.json(
        { error: 'Missing accessToken or instanceUrl' },
        { status: 400 }
      );
    }

    // Initialize jsforce connection
    const conn = new jsforce.Connection({
      accessToken: accessToken,
      instanceUrl: instanceUrl,
    });

    // Make the REST API request to fetch limits (health-related data)
    const response = await conn.request({
      url: '/services/data/v59.0/limits', // Use the latest version
      method: 'GET',
    });

    // Log and return the health data
    console.log('Health Data:', response);

    return NextResponse.json({
      success: true,
      data: response,
    });

  } catch (err) {
    console.error('Error fetching health data:', err);
    return NextResponse.json(
      { error: 'Server error', details: err.message },
      { status: 500 }
    );
  }
}
