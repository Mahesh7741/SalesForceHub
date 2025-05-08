import { NextRequest, NextResponse } from 'next/server';
import jsforce from 'jsforce';

export async function POST(request) {
  try {
    const body = await request.json();
    const { accessToken, instanceUrl, leadId, createOpportunity } = body;

    if (!accessToken || !instanceUrl || !leadId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const conn = new jsforce.Connection({ instanceUrl, accessToken });

    // Confirm lead exists
    try {
      const lead = await conn.sobject('Lead').retrieve(leadId);
      console.log('✅ Lead found:', lead.Id);
    } catch (err) {
      console.error('❌ Lead not found:', err);
      return NextResponse.json(
        { error: `Lead with ID ${leadId} does not exist.` },
        { status: 404 }
      );
    }

    // Fetch converted status
    let convertedStatus = 'Qualified';
    try {
      const statusResult = await conn.query(
        'SELECT MasterLabel FROM LeadStatus WHERE IsConverted = TRUE LIMIT 1'
      );
      if (statusResult.records.length > 0) {
        convertedStatus = statusResult.records[0].MasterLabel;
      }
    } catch {
      console.warn('Failed to fetch converted status. Using default.');
    }

    // Convert lead using SOAP API
    try {
      const result = await conn.soap.convertLead({
        leadId,
        convertedStatus,
        doNotCreateOpportunity: !createOpportunity,
      });

      return NextResponse.json({ success: true, data: result });
    } catch (err) {
      console.error('Lead conversion failed:', err);
      return NextResponse.json(
        { error: `Failed to convert lead: ${err instanceof Error ? err.message : 'Unknown error'}` },
        { status: 500 }
      );
    }

  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unexpected server error' },
      { status: 500 }
    );
  }
}
