// src\app\api\salesforce\verify\route.jsx
import { NextResponse } from 'next/server';
import jsforce from 'jsforce';

export async function POST(request) {
    try {
        const { instanceUrl, accessToken } = await request.json();
        
        if (!instanceUrl || !accessToken) {
            return NextResponse.json(
                { error: 'Instance URL and access token are required' },
                { status: 400 }
            );
        }

        // Create connection with existing session info
        const conn = new jsforce.Connection({
            instanceUrl,
            accessToken
        });

        try {
            // Attempt to get user identity to verify the session is still valid
            const userInfo = await conn.identity();

            const responseUserInfo = {
                display_name: userInfo.display_name,
                username: userInfo.username,
                email: userInfo.email,
                user_id: userInfo.user_id,
                organization_id: userInfo.organization_id,
                instance_url: instanceUrl,
                org_name: userInfo.organization_id
            };
            
            return NextResponse.json({
                success: true,
                userInfo: responseUserInfo
            });
        } catch {
            // Session expired or invalid
            return NextResponse.json(
                { error: 'Session expired or invalid', expired: true },
                { status: 401 }
            );
        }
    } catch (error) {
        console.error('Session verification error:', error);
        
        return NextResponse.json(
            { error: 'Failed to verify session' },
            { status: 500 }
        );
    }
}
