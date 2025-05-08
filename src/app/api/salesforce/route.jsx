// src\app\api\salesforce\route.js
import { NextResponse } from 'next/server';
import jsforce from 'jsforce';

export async function POST(request) {
  try {
    const { username, password, securityToken } = await request.json();
    console.log("check", username, password, securityToken);
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Create connection
    const conn = new jsforce.Connection({
      loginUrl: 'https://login.salesforce.com'
    });

    // Combine password and security token
    const passwordWithToken = password + (securityToken || '');

    // Login to Salesforce
    const login = await conn.login(username, passwordWithToken);
    console.log("login is ", login);

    // Get user identity
    const userInfo = await conn.identity();
    const result = await conn.query("SELECT Id, Name, Industry FROM Account LIMIT 10");
    console.log(result);
    console.log(userInfo);

    // Return user info and connection details (don't return sensitive data)
    return NextResponse.json({
      success: true,
      accessToken: conn.accessToken,
      instanceUrl: conn.instanceUrl,
      userInfo: {
        display_name: userInfo.display_name,
        username: userInfo.username,
        email: userInfo.email,
        user_id: userInfo.user_id,
        organization_id: userInfo.organization_id,
        instance_url: conn.instanceUrl,
        org_name: userInfo.organization_id,
      }
    });
  } catch (error) {
    console.error('Salesforce login error:', error);

    // Handle different types of errors
    let errorMessage = 'Failed to connect to Salesforce';
    let statusCode = 500;

    if (error && error.errorCode === 'INVALID_LOGIN') {
      errorMessage = 'Invalid username, password, or security token';
      statusCode = 401;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
