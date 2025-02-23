const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');

// Your Google Sheets configuration
const SPREADSHEET_ID = '1wJUC_pM_IAbuv8aKkmvMhThLe_ulZ-VmcBiSNxlrnOk';
const RANGE = 'Hospital Bookmarks!A:E';

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
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values;
    const headers = rows[0]; // Get header row
    const bookmarks = rows.slice(1).map(row => {
      const bookmark = {
        Category: row[headers.indexOf('Category')],
        Name: row[headers.indexOf('Name')],
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
    process.exit(1);
  }
}

generateBookmarksJson(); 