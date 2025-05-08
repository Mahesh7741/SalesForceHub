// src\app\api\updateApexClass\route.jsx
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Parse request body with error handling
    let classId, classBody, sfAuthData;
    try {
      const body = await request.json();
      classId = body.classId;
      classBody = body.classBody;
      sfAuthData = body.sfAuthData;
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid request body format" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!classId || !classBody || !sfAuthData?.instanceUrl || !sfAuthData?.accessToken) {
      return NextResponse.json(
        { 
          error: "Missing required fields",
          details: {
            classId: !classId ? "missing" : "present",
            classBody: !classBody ? "missing" : "present",
            instanceUrl: !sfAuthData?.instanceUrl ? "missing" : "present",
            accessToken: !sfAuthData?.accessToken ? "missing" : "present"
          }
        },
        { status: 400 }
      );
    }

    // Important: For Apex classes, we need to create a new MetadataContainer and ContainerAsyncRequest
    // Direct updates to ApexClass via PATCH are not allowed
    
    try {
      // Step 1: Create a MetadataContainer
      const containerId = await createMetadataContainer(sfAuthData);
      
      // Step 2: Create ApexClassMember within the container
      const memberId = await createApexClassMember(sfAuthData, containerId, classId, classBody);
      
      // Step 3: Create and deploy a ContainerAsyncRequest
      const requestId = await deployContainer(sfAuthData, containerId);
      
      // Step 4: Check the status of the deployment with better error handling and longer timeout
      const result = await checkDeploymentStatus(sfAuthData, requestId);
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: "Apex class updated successfully",
          timestamp: new Date().toISOString()
        });
      } else {
        return NextResponse.json({ 
          error: "Failed to update Apex class", 
          details: result.details
        }, { status: 400 });
      }

    } catch (fetchError) {
      console.error("Error during Apex class update:", fetchError);
      
      return NextResponse.json({ 
        error: "Error during Apex class update", 
        details: {
          message: fetchError.message,
          phase: fetchError.phase || "unknown"
        }
      }, { status: 500 });
    }

  } catch (err) {
    console.error("Salesforce Update Apex Class API error:", {
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

// Helper function to create metadata container
async function createMetadataContainer(sfAuthData) {
  const containerUrl = `${sfAuthData.instanceUrl}/services/data/v58.0/tooling/sobjects/MetadataContainer`;
  
  const containerResponse = await fetch(containerUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${sfAuthData.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Name: `ApexClassUpdate_${Date.now()}`
    })
  });

  if (!containerResponse.ok) {
    const errorBody = await containerResponse.text();
    console.error("Container creation error:", errorBody);
    
    const error = new Error(`Failed to create MetadataContainer: ${containerResponse.status} ${containerResponse.statusText}`);
    error.phase = "container_creation";
    throw error;
  }

  const containerData = await containerResponse.json();
  return containerData.id;
}

// Helper function to create apex class member
async function createApexClassMember(sfAuthData, containerId, classId, classBody) {
  const memberUrl = `${sfAuthData.instanceUrl}/services/data/v58.0/tooling/sobjects/ApexClassMember`;
  
  const memberResponse = await fetch(memberUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${sfAuthData.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ContentEntityId: classId,
      Body: classBody,
      MetadataContainerId: containerId
    })
  });

  if (!memberResponse.ok) {
    const errorBody = await memberResponse.text();
    console.error("Class member creation error:", errorBody);
    
    // Try to parse error for better messages
    let parsedError;
    try {
      parsedError = JSON.parse(errorBody);
    } catch (e) {
      parsedError = { rawError: errorBody };
    }
    
    const error = new Error(`Failed to create ApexClassMember: ${memberResponse.status} ${memberResponse.statusText}`);
    error.phase = "class_member_creation";
    error.details = parsedError;
    throw error;
  }

  const memberData = await memberResponse.json();
  return memberData.id;
}

// Helper function to deploy container
async function deployContainer(sfAuthData, containerId) {
  const deployUrl = `${sfAuthData.instanceUrl}/services/data/v58.0/tooling/sobjects/ContainerAsyncRequest`;
  
  const deployResponse = await fetch(deployUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${sfAuthData.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      MetadataContainerId: containerId,
      IsCheckOnly: false
    })
  });

  if (!deployResponse.ok) {
    const errorBody = await deployResponse.text();
    console.error("Deployment request error:", errorBody);
    
    // Try to parse error for better messages
    let parsedError;
    try {
      parsedError = JSON.parse(errorBody);
    } catch (e) {
      parsedError = { rawError: errorBody };
    }
    
    const error = new Error(`Failed to create ContainerAsyncRequest: ${deployResponse.status} ${deployResponse.statusText}`);
    error.phase = "deployment_request";
    error.details = parsedError;
    throw error;
  }

  const deployData = await deployResponse.json();
  return deployData.id;
}

// Helper function to check deployment status with improved polling
async function checkDeploymentStatus(sfAuthData, requestId) {
  // Build query that includes detailed error information
  const checkStatusUrl = `${sfAuthData.instanceUrl}/services/data/v58.0/tooling/query?q=${encodeURIComponent(
    `SELECT Id, Status, CompilerErrors, ErrorMsg, DeployDetails FROM ContainerAsyncRequest WHERE Id='${requestId}'`
  )}`;

  // Attempt to check status up to 15 times with a 2-second delay between attempts (30 seconds total)
  let attempts = 0;
  let statusData;
  let completed = false;

  while (attempts < 15 && !completed) {
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
    
    const statusResponse = await fetch(checkStatusUrl, {
      headers: {
        Authorization: `Bearer ${sfAuthData.accessToken}`,
      }
    });

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      console.error(`Status check error (attempt ${attempts + 1}):`, errorText);
      attempts++;
      continue;
    }

    statusData = await statusResponse.json();
    
    if (statusData.records && statusData.records.length > 0) {
      const status = statusData.records[0].Status;
      console.log(`Deployment status (attempt ${attempts + 1}):`, status);
      
      if (status === 'Completed' || status === 'Failed' || status === 'Error' || status === 'Aborted') {
        completed = true;
      }
    }
    
    attempts++;
  }

  // If we never got a completed status
  if (!completed) {
    return {
      success: false,
      details: {
        status: statusData?.records?.[0]?.Status || 'Timeout',
        errorMsg: 'Deployment status check timed out after 30 seconds',
        attemptsPerformed: attempts
      }
    };
  }

  // Check final result
  if (statusData?.records?.[0]?.Status === 'Completed') {
    return {
      success: true
    };
  } else {
    // Extract detailed error information
    const record = statusData?.records?.[0];
    
    // Parse CompilerErrors if it's a string (it might be JSON)
    let parsedCompilerErrors = null;
    if (record?.CompilerErrors) {
      try {
        parsedCompilerErrors = JSON.parse(record.CompilerErrors);
      } catch (e) {
        // If it's not valid JSON, use it as a string
        parsedCompilerErrors = record.CompilerErrors;
      }
    }
    
    // Check for deployment details
    let deploymentErrors = [];
    if (record?.DeployDetails) {
      try {
        const deployDetails = JSON.parse(record.DeployDetails);
        if (deployDetails.componentFailures && deployDetails.componentFailures.length > 0) {
          deploymentErrors = deployDetails.componentFailures.map(failure => ({
            problemType: failure.problemType,
            problem: failure.problem,
            componentType: failure.componentType,
            lineNumber: failure.lineNumber,
            columnNumber: failure.columnNumber
          }));
        }
      } catch (e) {
        console.error("Error parsing DeployDetails:", e);
      }
    }
    
    return {
      success: false,
      details: {
        status: record?.Status || 'Unknown',
        errorMsg: record?.ErrorMsg || 'Unknown error',
        compilerErrors: parsedCompilerErrors || 'No compiler errors available',
        deploymentErrors: deploymentErrors.length > 0 ? deploymentErrors : null
      }
    };
  }
}