    // import { NextResponse } from "next/server";
    // import jsforce from "jsforce";
    
    // export async function POST(request) {
    //   try {
    //     const body = await request.json();
    //     const { sfAuthData } = body;
    
    //     // Validate input data
    //     if (!sfAuthData?.instanceUrl || !sfAuthData?.accessToken) {
    //       return NextResponse.json(
    //         { error: "Missing authentication data" },
    //         { status: 400 }
    //       );
    //     }
    
    //     const conn = new jsforce.Connection({
    //       instanceUrl: sfAuthData.instanceUrl,
    //       accessToken: sfAuthData.accessToken,
    //     });
    
    //     const query = `
    //       SELECT Id, Name, DeveloperName, Subject, HtmlValue, Body, CreatedDate, LastModifiedDate, FolderId
    //       FROM EmailTemplate
    //       ORDER BY LastModifiedDate DESC
    //       LIMIT 100
    //     `;
    
    //     const result = await conn.query(query);
    //     console.log("Fetched email templates:", result.records);
    //     return NextResponse.json({
    //       success: true,
    //       totalSize: result.totalSize,
    //       records: result.records,
    //     });
    //   } catch (err) {
    //     console.error("Error fetching email templates:", err);
    //     return NextResponse.json(
    //       {
    //         error: "Internal server error",
    //         message: err.message || "Something went wrong",
    //       },
    //       { status: 500 }
    //     );
    //   }
    // }
    


//src\app\api\email\route.js

    import { NextResponse } from "next/server";
import jsforce from "jsforce";

// GET or fetch templates
export async function POST(request) {
  try {
    const body = await request.json();
    const { sfAuthData, emailTemplateData } = body;

    // If no template data is provided, this is a GET request to fetch templates
    if (!emailTemplateData) {
      // Validate input data
      if (!sfAuthData?.instanceUrl || !sfAuthData?.accessToken) {
        return NextResponse.json(
          { error: "Missing authentication data" },
          { status: 400 }
        );
      }

      const conn = new jsforce.Connection({
        instanceUrl: sfAuthData.instanceUrl,
        accessToken: sfAuthData.accessToken,
      });

      const query = `
        SELECT Id, Name, DeveloperName, Subject, HtmlValue, Body, CreatedDate, LastModifiedDate, FolderId
        FROM EmailTemplate
        ORDER BY LastModifiedDate DESC
        LIMIT 100
      `;

      const result = await conn.query(query);
      console.log("Fetched email templates:", result.records);
      return NextResponse.json({
        success: true,
        totalSize: result.totalSize,
        records: result.records,
      });
    } 
    // CREATE a new template
    else {
      // Validate input data for creating a template
      if (!sfAuthData?.instanceUrl || !sfAuthData?.accessToken) {
        return NextResponse.json(
          { error: "Missing authentication data" },
          { status: 400 }
        );
      }
    
      const { name, subject, htmlContent, folder = "unfiled$public" } = emailTemplateData;
    
      if (!name || !subject || !htmlContent) {
        return NextResponse.json(
          { error: "Missing required template fields" },
          { status: 400 }
        );
      }
    
      const conn = new jsforce.Connection({
        instanceUrl: sfAuthData.instanceUrl,
        accessToken: sfAuthData.accessToken,
      });
    
      // Create a unique DeveloperName from the template name
      const timestamp = Date.now();
      const developerName = name
        .replace(/[^a-zA-Z0-9]/g, '_') // Replace non-alphanumeric with underscore
        .substring(0, 30) + '_' + timestamp; // Add timestamp to ensure uniqueness
    
      // First, check if folder is ID or name
      let folderId = folder;
      if (typeof folder === 'string' && !folder.match(/^[a-zA-Z0-9]{15,18}$/)) {
        // It's not an ID, so try to find the folder
        try {
          const folderQuery = `SELECT Id FROM Folder WHERE DeveloperName = '${folder.replace(/'/g, "\\'")}' AND Type = 'Email' LIMIT 1`;
          console.log("Folder query:", folderQuery);
          const folderResult = await conn.query(folderQuery);
          
          if (folderResult.records.length > 0) {
            folderId = folderResult.records[0].Id;
            console.log("Found folder ID:", folderId);
          } else if (folder === "unfiled$public") {
            // Try to get the default public folder
            console.log("Looking for default public folder");
            const publicFolderQuery = "SELECT Id FROM Folder WHERE DeveloperName = 'unfiled$public' LIMIT 1";
            const publicFolderResult = await conn.query(publicFolderQuery);
            
            if (publicFolderResult.records.length > 0) {
              folderId = publicFolderResult.records[0].Id;
              console.log("Found public folder ID:", folderId);
            }
          }
        } catch (error) {
          console.error("Error finding folder:", error);
          // Continue with default folder name if there's an error
        }
      }
    
      // Create template
      try {
        const templateData = {
          Name: name,
          DeveloperName: developerName,
          Subject: subject,
          HtmlValue: htmlContent,
          Body: htmlContent.replace(/<[^>]*>/g, ''), // Strip HTML for plain text version
          FolderId: folderId,
          IsActive: true,
          TemplateType: 'html',
          Encoding: 'UTF-8'
        };
    
        // console.log("Creating template with data:", templateData);
        const createResult = await conn.sobject('EmailTemplate').create(templateData);
    
        if (createResult.success) {
          return NextResponse.json({
            success: true,
            emailTemplateId: createResult.id,
            message: "Email template created successfully"
          });
        } else {
          return NextResponse.json(
            { error: "Failed to create template", details: createResult.errors },
            { status: 400 }
          );
        }
      } catch (error) {
        console.error("Error creating template:", error);
        
        // Try to provide more detailed error information
        let errorMessage = error.message;
        if (error.errorCode && error.fields) {
          errorMessage = `${error.errorCode}: Error with fields ${error.fields.join(', ')}`;
        }
        
        return NextResponse.json(
          { 
            error: "Failed to create template", 
            details: errorMessage,
            fullError: error.toString()
          },
          { status: 500 }
        );
      }
    }
  } catch (err) {
    console.error("Error processing request:", err);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: err.message || "Something went wrong",
      },
      { status: 500 }
    );
  }
}