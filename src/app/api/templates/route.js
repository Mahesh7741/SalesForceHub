// app/api/templates/route.ts - Get all templates
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Parse query parameters if needed
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'public'; // Default to public folder
    
    // Extract auth data from headers or session
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '') || process.env.SF_ACCESS_TOKEN;
    const instanceUrl = process.env.SF_INSTANCE_URL || 'https://yourInstance.salesforce.com';
    
    if (!accessToken) {
      return NextResponse.json(
        { error: "Unauthorized request" },
        { status: 401 }
      );
    }
    
    // Build URL for the Salesforce API request to fetch templates
    // Adjust the SOQL query as needed
    const query = encodeURIComponent(
      `SELECT Id, Name, Subject, HtmlValue, FolderId FROM EmailTemplate WHERE FolderName = '${folder}' ORDER BY Name ASC`
    );
    
    const url = `${instanceUrl}/services/data/v57.0/query/?q=${query}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Salesforce API error:', errorData);
      return NextResponse.json(
        { error: "Failed to fetch templates from Salesforce" },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Transform the Salesforce response into the format our frontend expects
    const templates = data.records.map(record => ({
      id: record.Id,
      name: record.Name,
      subject: record.Subject,
      htmlContent: record.HtmlValue,
      folderId: record.FolderId
    }));

    return NextResponse.json({ 
      success: true, 
      templates 
    });
    
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: "Failed to process request", details: error.message },
      { status: 500 }
    );
  }
}