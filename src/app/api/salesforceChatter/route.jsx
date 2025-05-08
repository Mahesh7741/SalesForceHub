// filepath: c:\Users\MAHESH\Desktop\test\SalesForceCloudManageMentProject\src\app\api\salesforceChatter\route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    console.log("API Route Called");
    
    // Parse request body
    const body = await request.json();
    const { accessToken, instanceUrl } = body;

    if (!accessToken || !instanceUrl) {
      return NextResponse.json({ error: "Missing accessToken or instanceUrl" }, { status: 400 });
    }

    console.log("Request received:", body);

    const soqlQuery = encodeURIComponent(`
      SELECT Id, Body, CreatedBy.Name, CreatedDate, BestCommentId,CommentCount,Title,Type,Status,LinkUrl,LikeCount
      FROM FeedItem
      ORDER BY CreatedDate DESC
    `);

    const response = await fetch(`${instanceUrl}/services/data/v59.0/query?q=${soqlQuery}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Salesforce API Error:", errorText);
      return NextResponse.json(
        { error: errorText || "Failed to fetch Chatter posts" }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data.records);
  } catch (err) {
    console.error("Error in API Route:", err.message);
    return NextResponse.json(
      { error: err.message || "Failed to fetch Chatter posts" }, 
      { status: 500 }
    );
  }
}

// // filepath: c:\Users\MAHESH\Desktop\test\SalesForceCloudManageMentProject\src\app\api\salesforceChatter\route.js
// import { NextResponse } from 'next/server';

// export async function POST(request) {
//   try {
//     console.log("API Route Called");
    
//     // Parse request body
//     const body = await request.json();
//     const { accessToken, instanceUrl } = body;
//     console.log("Auth Data:", { accessToken, instanceUrl });
//     if (!accessToken || !instanceUrl) {
//       return NextResponse.json({ error: "Missing accessToken or instanceUrl" }, { status: 400 });
//     }

//     console.log("Request received with valid credentials");

//     // Enhanced SOQL query to get more data
//     const soqlQuery = encodeURIComponent(`
//       SELECT 
//         Id, 
//         Body, 
//         CreatedBy.Name, 
//         CreatedBy.SmallPhotoUrl, 
//         CreatedBy.Title,
//         CreatedDate, 
//         Type, 
//         ParentId, 
//         LikeCount, 
//         CommentCount,
//         Title,
//         LinkUrl
//       FROM FeedItem
//       ORDER BY CreatedDate DESC
//       LIMIT 50
//     `);

//     // Fetch feed items
//     const feedItemsResponse = await fetch(`${instanceUrl}/services/data/v59.0/query?q=${soqlQuery}`, {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         "Content-Type": "application/json",
//       },
//     });

//     if (!feedItemsResponse.ok) {
//       const errorText = await feedItemsResponse.text();
//       console.error("Salesforce API Error:", errorText);
//       return NextResponse.json(
//         { error: errorText || "Failed to fetch Chatter posts" }, 
//         { status: feedItemsResponse.status }
//       );
//     }

//     const feedItemsData = await feedItemsResponse.json();
//     const feedItems = feedItemsData.records;

//     // For each feed item, fetch its comments if there are any
//     const feedItemsWithComments = await Promise.all(feedItems.map(async (item) => {
//       if (item.CommentCount > 0) {
//         try {
//           const commentsResponse = await fetch(
//             `${instanceUrl}/services/data/v59.0/chatter/feed-items/${item.Id}/comments`, 
//             {
//               headers: {
//                 Authorization: `Bearer ${accessToken}`,
//                 "Content-Type": "application/json",
//               },
//             }
//           );
          
//           if (commentsResponse.ok) {
//             const commentsData = await commentsResponse.json();
//             return { ...item, comments: commentsData.items || [] };
//           }
//         } catch (error) {
//           console.error(`Error fetching comments for post ${item.Id}:`, error);
//         }
//       }
      
//       return { ...item, comments: [] };
//     }));

//     // Get user's profile information
//     try {
//       const userInfoResponse = await fetch(
//         `${instanceUrl}/services/data/v59.0/chatter/users/me`,
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );
      
//       if (userInfoResponse.ok) {
//         const userInfo = await userInfoResponse.json();
        
//         return NextResponse.json({
//           currentUser: userInfo,
//           feedItems: feedItemsWithComments
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching user info:", error);
//     }

//     // Return just the feed items if user info fetch fails
//     return NextResponse.json({ feedItems: feedItemsWithComments });
//   } catch (err) {
//     console.error("Error in API Route:", err.message);
//     return NextResponse.json(
//       { error: err.message || "Failed to fetch Chatter posts" }, 
//       { status: 500 }
//     );
//   }
// }

// // Also support posting new chatter messages
// export async function PUT(request) {
//   try {
//     const body = await request.json();
//     const { accessToken, instanceUrl, postText, subjectId } = body;

//     if (!accessToken || !instanceUrl || !postText) {
//       return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
//     }

//     const feedItemData = {
//       body: {
//         messageSegments: [
//           {
//             type: "Text",
//             text: postText
//           }
//         ]
//       }
//     };

//     // If subjectId is provided, associate the post with that record
//     if (subjectId) {
//       feedItemData.subjectId = subjectId;
//     }

//     const response = await fetch(
//       `${instanceUrl}/services/data/v59.0/chatter/feed-items`, 
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(feedItemData)
//       }
//     );

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("Salesforce API Error:", errorText);
//       return NextResponse.json(
//         { error: errorText || "Failed to create Chatter post" }, 
//         { status: response.status }
//       );
//     }

//     const data = await response.json();
//     return NextResponse.json(data);
//   } catch (err) {
//     console.error("Error posting chatter message:", err.message);
//     return NextResponse.json(
//       { error: err.message || "Failed to create Chatter post" }, 
//       { status: 500 }
//     );
//   }
// }