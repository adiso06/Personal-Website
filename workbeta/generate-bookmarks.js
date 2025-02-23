const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');

// Your Google Sheets configuration
const SPREADSHEET_ID = '1wJUC_pM_IAbuv8aKkmvMhThLe_ulZ-VmcBiSNxlrnOk';
const RANGE = 'Sheet1!A:D';

// Update to use environment variable for API key
const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;

async function generateBookmarksJson() {
  try {
    // Use path.join for cross-platform compatibility
    const credentialsPath = path.join(__dirname, 'credentials.json');
    const CREDENTIALS = require(credentialsPath);

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
    const bookmarks = rows.slice(1).map(row => {
      const bookmark = {
        Category: row[0],
        Name: row[1],
        URL: row[2],
        Type: row[3] || 'link'
      };

      // Properly handle dropdown links
      if (bookmark.Type === 'dropdown' && row[4]) {
        try {
          // If it's already a JSON string, parse it, otherwise assume it's raw text
          bookmark.Links = typeof row[4] === 'string' && row[4].startsWith('[') 
            ? JSON.parse(row[4])
            : row[4].split(',').map(link => {
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

    // Save to static file, using path.join for cross-platform compatibility
    const outputPath = path.join(__dirname, '..', 'bookmarks.json');
    await fs.writeFile(outputPath, JSON.stringify(bookmarks, null, 2));
    console.log('Successfully generated bookmarks.json');
  } catch (error) {
    console.error('Error generating bookmarks:', error);
    process.exit(1); // Ensure GitHub Actions knows if the script failed
  }
}

generateBookmarksJson(); 