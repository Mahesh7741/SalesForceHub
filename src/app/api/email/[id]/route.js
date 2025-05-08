//src\app\api\email\[id]\route.js
import { NextResponse } from "next/server";
import jsforce from "jsforce";

// Update an existing email template
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { sfAuthData, emailTemplateData } = body;
    
    if (!sfAuthData || !emailTemplateData) {
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 400 }
      );
    }
    
    const { instanceUrl, accessToken } = sfAuthData;
    const { name, subject, htmlContent } = emailTemplateData;
    
    if (!name || !subject || !htmlContent) {
      return NextResponse.json(
        { error: "Missing required template fields" },
        { status: 400 }
      );
    }
    
    // Prepare the template data for update
    const templateData = {
      Name: name,
      Subject: subject,
      HtmlValue: htmlContent
    };
    
    const updateUrl = `${instanceUrl}/services/data/v57.0/sobjects/EmailTemplate/${id}`;
    
    const updateResponse = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(templateData)
    });
    
    // Salesforce returns 204 No Content on successful PATCH
    if (updateResponse.status !== 204) {
      const errorText = await updateResponse.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = errorText;
      }
      console.error('Salesforce API error:', errorData);
      return NextResponse.json(
        { error: "Failed to update template", details: errorData },
        { status: updateResponse.status }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Email template updated successfully"
    });
    
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: "Failed to process request", details: error.message },
      { status: 500 }
    );
  }
}

// Delete an email template
// src\app\api\email\[id]\route.js - Fixed DELETE function
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }

    // Parse request body
    let sfAuthData;
    try {
      const body = await request.json();
      sfAuthData = body.sfAuthData;
    } catch (e) {
      console.log("Could not parse request body:", e);
    }
    
    // If no auth data in body, try headers
    if (!sfAuthData || !sfAuthData.accessToken || !sfAuthData.instanceUrl) {
      const authHeader = request.headers.get('authorization');
      const instanceUrl = request.headers.get('x-salesforce-instance');
      
      if (authHeader) {
        const accessToken = authHeader.replace('Bearer ', '');
        sfAuthData = {
          accessToken,
          instanceUrl: instanceUrl || process.env.SF_INSTANCE_URL
        };
      }
    }
    
    // If still no valid auth data, return error
    if (!sfAuthData || !sfAuthData.accessToken || !sfAuthData.instanceUrl) {
      return NextResponse.json(
        { error: "Missing authentication data" },
        { status: 401 }
      );
    }
    
    // Create jsforce connection with validated auth data
    const conn = new jsforce.Connection({
      instanceUrl: sfAuthData.instanceUrl,
      accessToken: sfAuthData.accessToken,
    });
    
    console.log(`Attempting to delete template with ID: ${id}`);
    
    try {
      const deleteResult = await conn.sobject('EmailTemplate').destroy(id);
      
      if (deleteResult.success) {
        return NextResponse.json({
          success: true,
          message: "Email template deleted successfully"
        });
      } else {
        return NextResponse.json(
          { error: "Failed to delete template", details: deleteResult.errors },
          { status: 400 }
        );
      }
    } catch (sfError) {
      console.error('Salesforce delete error:', sfError);
      
      // Fall back to REST API if jsforce fails
      console.log("Falling back to REST API for deletion");
      const deleteUrl = `${sfAuthData.instanceUrl}/services/data/v57.0/sobjects/EmailTemplate/${id}`;
      
      const deleteResponse = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sfAuthData.accessToken}`
        }
      });
      
      // Salesforce returns 204 No Content on successful DELETE
      if (deleteResponse.status !== 204) {
        const errorText = await deleteResponse.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = errorText;
        }
        console.error('Salesforce API error:', errorData);
        return NextResponse.json(
          { error: "Failed to delete template", details: errorData },
          { status: deleteResponse.status }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: "Email template deleted successfully"
      });
    }
    
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: "Failed to process request", details: error.message },
      { status: 500 }
    );
  }
}