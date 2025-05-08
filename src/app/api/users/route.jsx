import { NextResponse } from "next/server";
import jsforce from "jsforce";

export async function POST(request) {
  try {
    // Parse request body
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

    // Validate auth data
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

    const { instanceUrl, accessToken } = sfAuthData;
    const conn = new jsforce.Connection({ instanceUrl, accessToken });

    // SOQL Query
    const query = `
     SELECT 
  Id,
  Name,
  Username,
  Email,
  Alias,
  FirstName,
  LastName,
  Title,
  Department,
  Profile.Name,
  UserRole.Name,
  ManagerId,
  Manager.Name,
  CreatedDate,
  LastLoginDate,
  IsActive,
  TimeZoneSidKey,
  LocaleSidKey,
  EmailEncodingKey,
  LanguageLocaleKey,
  UserType,
  UserRoleId
FROM User
WHERE IsActive = true
ORDER BY LastName

    `;

    // Execute query
    const result = await conn.query(query);
    console.log("Fetched users:", result.records);
    if (!result.records) {
      return NextResponse.json(
        {
          error: "Invalid response from Salesforce",
          details: "No records field in response"
        },
        { status: 500 }
      );
    }

    // Transform result
    const users = result.records.map(user => ({
      id: user.Id,
      name: user.Name,
      username: user.Username,
      email: user.Email,
      alias: user.Alias,
      firstName: user.FirstName,
      lastName: user.LastName,
      title: user.Title,
      department: user.Department,
      profileName: user.Profile?.Name,
      roleName: user.Role?.Name,
      managerId: user.ManagerId,
      managerName: user.Manager?.Name,
      createdDate: user.CreatedDate,
      lastLoginDate: user.LastLoginDate,
      isActive: user.IsActive,
      timeZoneSidKey: user.TimeZoneSidKey,
      localeSidKey: user.LocaleSidKey,
      emailEncodingKey: user.EmailEncodingKey,
      languageLocaleKey: user.LanguageLocaleKey,
      userType: user.UserType,
      userRoleId: user.UserRoleId
    }));

    return NextResponse.json({
      success: true,
      users,
      totalSize: result.totalSize,
      provider: "salesforce-api",
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error("Salesforce Users API error:", {
      message: err.message,
      stack: err.stack
    });

    return NextResponse.json({
      error: "Internal server error",
      message: err.message || "Something went wrong",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
