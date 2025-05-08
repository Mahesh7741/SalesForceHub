import { NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs';
import csvParser from 'csv-parser';
import axios from 'axios';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  const form = formidable({ multiples: false });

  const data = await new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  }).catch((err) => {
    return NextResponse.json({ error: 'Error parsing file' }, { status: 500 });
  });

  if (!data || !data.files || !data.files.file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const file = data.files.file;
  const records = [];

  return new Promise((resolve) => {
    fs.createReadStream(file.filepath)
      .pipe(csvParser())
      .on('data', (row) => records.push(row))
      .on('end', async () => {
        try {
          const accessToken = "00DNS00000DIRAL!AQEAQA5bRSAouHWo3DEn_YYQcwmrd8An..aUY7xC30_MgGprc_7aKNm7GccXqeVGiuhPfZI0bZpJYLIVP6j1ujUX_i_z7Zr8"
          const instanceUrl = 'https://koshine-dev-ed.develop.my.salesforce.com';

          for (const record of records) {
            await axios.post(
              `${instanceUrl}/services/data/v58.0/sobjects/YourObject__c`,
              record,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
              }
            );
          }

          resolve(
            NextResponse.json(
              { message: 'Data uploaded successfully to Salesforce' },
              { status: 200 }
            )
          );
        } catch (error) {
          console.error(error.response?.data || error.message);
          resolve(
            NextResponse.json(
              { error: 'Salesforce upload failed' },
              { status: 500 }
            )
          );
        }
      });
  });
}
