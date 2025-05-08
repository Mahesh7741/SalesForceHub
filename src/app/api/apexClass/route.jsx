// src\app\api\apexClass\route.jsx
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Parse request body with error handling
    let className, sfAuthData;
    try {
      const body = await request.json();
      className = body.className;
      sfAuthData = body.sfAuthData;
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid request body format" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!className || !sfAuthData?.instanceUrl || !sfAuthData?.accessToken) {
      return NextResponse.json(
        { 
          error: "Missing required fields",
          details: {
            className: !className ? "missing" : "present",
            instanceUrl: !sfAuthData?.instanceUrl ? "missing" : "present",
            accessToken: !sfAuthData?.accessToken ? "missing" : "present"
          }
        },
        { status: 400 }
      );
    }

    // Sanitize class name and build query
    const sanitizedClassName = className.replace(/'/g, "\\'");
    const query = `
      SELECT Id, Name, ApiVersion, Status, Body, NamespacePrefix, LengthWithoutComments, BodyCrc,
      IsValid, CreatedDate, LastModifiedDate
      FROM ApexClass 
      WHERE Name = '${sanitizedClassName}'
      LIMIT 1
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

      if (!data.records || data.records.length === 0) {
        return NextResponse.json({ 
          error: "Apex class not found",
          className: sanitizedClassName
        }, { 
          status: 404 
        });
      }

      const classInfo = data.records[0];

      return NextResponse.json({
        success: true,
        class: {
          id: classInfo.Id,
          name: classInfo.Name,
          apiVersion: classInfo.ApiVersion,
          status: classInfo.Status,
          body: classInfo.Body,
          namespacePrefix: classInfo.NamespacePrefix,
          lengthWithoutComments: classInfo.LengthWithoutComments,
          bodyCrc: classInfo.BodyCrc,
          isValid: classInfo.IsValid,
          createdDate: classInfo.CreatedDate,
          lastModifiedDate: classInfo.LastModifiedDate
        },
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
    console.error("Salesforce Apex Class API error:", {
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