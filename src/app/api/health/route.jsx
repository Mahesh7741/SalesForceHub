// // /src\app\api\health\route.jsx
// export default async function handler(req, res) {
//     if (req.method !== 'POST') {
//       return res.status(405).json({ error: 'Method not allowed' });
//     }
    
//     const { accessToken, instanceUrl } = req.body;
//     console.log("accessToken",accessToken);
//     console.log("instanceUrl",instanceUrl);
//     if (!accessToken || !instanceUrl) {
//       return res.status(400).json({ error: 'Missing accessToken or instanceUrl' });
//     }
  
//     try {
//       const response = await fetch(`${instanceUrl}/services/data/v59.0/limits`, {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           'Content-Type': 'application/json',
//         },
//       });
  
//       if (!response.ok) {
//         const errorText = await response.text();
//         return res.status(response.status).json({ error: 'Salesforce API error', details: errorText });
//       }
  
//       const data = await response.json();
//       res.status(200).json(data);
//     } catch (err) {
//       res.status(500).json({ error: 'Server error', details: err.message });
//     }
//   }
 
  

// import { NextResponse } from 'next/server';

// export async function POST(request) {
//   try {
//     const { accessToken, instanceUrl } = await request.json();
//     console.log("accessToken", accessToken);
//     console.log("instanceUrl", instanceUrl);

//     if (!accessToken || !instanceUrl) {
//       return NextResponse.json(
//         { error: 'Missing accessToken or instanceUrl' },
//         { status: 400 }
//       );
//     }

//     // Call Salesforce API to get limits
//     const response = await fetch(`${instanceUrl}/services/data/v59.0/limits`, {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       return NextResponse.json(
//         { error: 'Salesforce API error', details: errorText },
//         { status: response.status }
//       );
//     }

//     const data = await response.json();
//     return NextResponse.json({ success: true, data });

//   } catch (err) {
//     console.error('Server error:', err);
//     return NextResponse.json(
//       { error: 'Server error', details: err.message },
//       { status: 500 }
//     );
//   }
// }


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
