// import formidable from 'formidable';
// import fs from 'fs';
// import csvParser from 'csv-parser';
// import axios from 'axios';

// export const config = {
//   api: {
//     bodyParser: false, // required to handle form-data
//   },
// };

// export default async function handler(req, res) {
//     if (req.method !== 'POST') {
//       return res.status(405).json({ error: 'Method Not Allowed' }); // Return JSON
//     }
  
//     const form = new formidable.IncomingForm();
  
//     form.parse(req, async (err, fields, files) => {
//       if (err) {
//         return res.status(500).json({ error: 'Error parsing file' }); // Return JSON
//       }
  
//       const file = files.file;
//       if (!file || Array.isArray(file)) {
//         return res.status(400).json({ error: 'No file uploaded' }); // Return JSON
//       }
  
//       const records = [];
  
//       fs.createReadStream(file.filepath)
//         .pipe(csvParser())
//         .on('data', (row) => records.push(row))
//         .on('end', async () => {
//           try {
//             const accessToken = 'YOUR_SALESFORCE_ACCESS_TOKEN';
//             const instanceUrl = 'https://yourInstance.salesforce.com';
  
//             for (const record of records) {
//               await axios.post(
//                 `${instanceUrl}/services/data/v58.0/sobjects/YourObject__c`,
//                 record,
//                 {
//                   headers: {
//                     Authorization: `Bearer ${accessToken}`,
//                     'Content-Type': 'application/json',
//                   },
//                 }
//               );
//             }
  
//             res.status(200).json({ message: 'Data uploaded successfully to Salesforce' }); // Return JSON
//           } catch (error) {
//             console.error(error.response?.data || error.message);
//             res.status(500).json({ error: 'Salesforce upload failed' }); // Return JSON
//           }
//         });
//     });
//   }


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
          const accessToken = 'YOUR_SALESFORCE_ACCESS_TOKEN';
          const instanceUrl = 'https://yourInstance.salesforce.com';

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
