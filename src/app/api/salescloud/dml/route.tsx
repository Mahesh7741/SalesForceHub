
import { NextResponse } from 'next/server';
import jsforce from 'jsforce';

export async function POST(request: Request) {
  try {
    const { accessToken, instanceUrl, operation, objectType, data, id } = await request.json();
    console.log("id ",id)
    if (!accessToken || !instanceUrl || !operation || !objectType) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const conn = new jsforce.Connection({
      instanceUrl,
      accessToken,
    });

    let result;
    
    switch (operation.toLowerCase()) {
        case 'create':
            if (!data) {
              return NextResponse.json(
                { error: 'Missing data for create operation' },
                { status: 400 }
              );
            }
            try {
              result = await conn.sobject(objectType).create(data);
              console.log("creation",result)
            } catch (error) {
              // Handle duplicate detection error specifically
              if ((error as { errorCode?: string }).errorCode === 'DUPLICATES_DETECTED') {
                return NextResponse.json(
                  { 
                    error: 'A duplicate record was detected. Please check the data and try again.',
                    details: (error as { message: string }).message
                  },
                  { status: 409 } // Using 409 Conflict for duplicates
                );
              }
              // Re-throw other errors
              throw error;
            }
            break;
      
      case 'update':
        if (!data || !id) {
          return NextResponse.json(
            { error: 'Missing data or id for update operation' },
            { status: 400 }
          );
        }
        result = await conn.sobject(objectType).update({ ...data, Id: id });
        break;
      
      case 'delete':
        if (!id) {
          return NextResponse.json(
            { error: 'Missing id for delete operation' },
            { status: 400 }
          );
        }
        result = await conn.sobject(objectType).destroy(id);
        break;
      
      default:
        return NextResponse.json(
          { error: `Unsupported operation: ${operation}` },
          { status: 400 }
        );
    }

    return NextResponse.json({ 
      success: true, 
      result: result
    });
  } catch (error) {
    console.error('Salesforce DML error:', error);
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : 'An error occurred') },
      { status: 500 }
    );
  }
}