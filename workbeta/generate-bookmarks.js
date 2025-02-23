const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');

// Your Google Sheets configuration
const SPREADSHEET_ID = '1wJUC_pM_IAbuv8aKkmvMhThLe_ulZ-VmcBiSNxlrnOk';
const RANGE = 'Sheet1!A:D';

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
    const bookmarks = rows.slice(1).map(row => ({
      Category: row[0],
      Name: row[1],
      URL: row[2],
      Type: row[3] || 'link',
      Links: row[3] === 'dropdown' ? row[4] : undefined
    }));

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