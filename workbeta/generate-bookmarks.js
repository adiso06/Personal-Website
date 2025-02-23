const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');

// Your Google Sheets configuration
const SPREADSHEET_ID = '1wJUC_pM_IAbuv8aKkmvMhThLe_ulZ-VmcBiSNxlrnOk';
const SHEET_NAME = 'Sheet1';

async function generateBookmarksJson() {
  try {
    // Get credentials from environment variable
    if (!process.env.GOOGLE_SHEETS_CREDENTIALS) {
      throw new Error('GOOGLE_SHEETS_CREDENTIALS environment variable is not set');
    }

    const CREDENTIALS = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);

    const auth = new google.auth.GoogleAuth({
      credentials: CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // First, verify the sheet exists and get its properties
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const sheet = spreadsheet.data.sheets.find(s => 
      s.properties.title === SHEET_NAME
    );

    if (!sheet) {
      throw new Error(`Sheet "${SHEET_NAME}" not found. Available sheets: ${
        spreadsheet.data.sheets.map(s => s.properties.title).join(', ')
      }`);
    }

    // Now get the data using the sheet's ID
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:E1000`, // More specific range
    });

    if (!response.data.values || response.data.values.length === 0) {
      throw new Error('No data found in sheet');
    }

    const rows = response.data.values;
    const headers = rows[0]; // Get header row
    console.log('Headers found:', headers); // Debug log

    const bookmarks = rows.slice(1).map(row => {
      const bookmark = {
        Category: row[headers.indexOf('Category')] || '',
        Name: row[headers.indexOf('Name')] || '',
        URL: row[headers.indexOf('URL')] || '',
        Type: row[headers.indexOf('Type')] || 'link'
      };

      // Handle Links column for dropdowns
      if (bookmark.Type === 'dropdown' && row[headers.indexOf('Links')]) {
        try {
          const linksData = row[headers.indexOf('Links')];
          bookmark.Links = linksData.startsWith('[') 
            ? JSON.parse(linksData)
            : linksData.split(',').map(link => {
                const [name, url] = link.split('|').map(s => s.trim());
                return { name, url };
              });
        } catch (e) {
          console.warn(`Failed to parse links for ${bookmark.Name}:`, e);
          bookmark.Links = [];
        }
      }

      return bookmark;
    });

    const outputPath = path.join(__dirname, 'bookmarks.json');
    await fs.writeFile(outputPath, JSON.stringify(bookmarks, null, 2));
    console.log('Successfully generated bookmarks.json');
  } catch (error) {
    console.error('Error generating bookmarks:', error);
    if (error.errors) {
      console.error('Detailed errors:', JSON.stringify(error.errors, null, 2));
    }
    process.exit(1);
  }
}

generateBookmarksJson(); 