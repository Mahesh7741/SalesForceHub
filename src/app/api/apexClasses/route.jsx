// src\app\api\apexClasses\route.jsx
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Parse request body with error handling
    let sfAuthData;
    try {
      const body = await request.json();
      sfAuthData = body.sfAuthData;
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid request body format" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!sfAuthData?.instanceUrl || !sfAuthData?.accessToken) {
      return NextResponse.json(
        { 
          error: "Missing authentication data",
          details: {
            instanceUrl: !sfAuthData?.instanceUrl ? "missing" : "present",
            accessToken: !sfAuthData?.accessToken ? "missing" : "present"
          }
        },
        { status: 400 }
      );
    }

    // Build SOQL query to fetch all classes with relevant fields
    // Limiting to 100 to avoid performance issues, can be paginated in future versions
    const query = `
      SELECT Id, Name, ApiVersion, Status, NamespacePrefix, LengthWithoutComments, 
             BodyCrc, IsValid, CreatedDate, LastModifiedDate 
      FROM ApexClass 
      ORDER BY Name ASC
      LIMIT 100
    `;

    // Build URL with encoded query
    const url = `${sfAuthData.instanceUrl}/services/data/v58.0/tooling/query?q=${encodeURIComponent(query)}`;

    // Fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${sfAuthData.accessToken}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        return NextResponse.json({ 
          error: "Failed to fetch from Salesforce", 
          details: errorBody,
          status: response.status,
          statusText: response.statusText
        }, { 
          status: response.status 
        });
      }

      const data = await response.json();

      if (!data.records) {
        return NextResponse.json({ 
          error: "Invalid response from Salesforce",
          details: "No records field in response"
        }, { 
          status: 500 
        });
      }

      // Transform the data for the frontend
      const classes = data.records.map(cls => ({
        id: cls.Id,
        name: cls.Name,
        apiVersion: cls.ApiVersion,
        status: cls.Status,
        namespacePrefix: cls.NamespacePrefix,
        lengthWithoutComments: cls.LengthWithoutComments,
        bodyCrc: cls.BodyCrc,
        isValid: cls.IsValid,
        createdDate: cls.CreatedDate,
        lastModifiedDate: cls.LastModifiedDate
      }));

      return NextResponse.json({
        success: true,
        classes,
        totalSize: data.totalSize,
        provider: "salesforce-tooling-api",
        timestamp: new Date().toISOString()
      });

    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        return NextResponse.json({ 
          error: "Request timeout", 
          details: "The request took too long to complete"
        }, { 
          status: 504 
        });
      }
      throw fetchError; // Re-throw other fetch errors
    }

  } catch (err) {
    console.error("Salesforce Apex Classes API error:", {
      message: err.message,
      stack: err.stack
    });
    
    return NextResponse.json({
      error: "Internal server error",
      message: err.message || "Something went wrong",
      timestamp: new Date().toISOString()
    }, { 
      status: 500 
    });
  }
}