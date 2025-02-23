const { google } = require('googleapis');
const fs = require('fs').promises;

// Your Google Sheets credentials and configuration
const CREDENTIALS = require('./credentials.json');
// Replace this with your actual spreadsheet ID from the URL
const SPREADSHEET_ID = '1wJUC_pM_IAbuv8aKkmvMhThLe_ulZ-VmcBiSNxlrnOk'; // Put your actual spreadsheet ID here
const RANGE = 'Sheet1!A:D'; // Make sure this matches your sheet name and range

async function generateBookmarksJson() {
  try {
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

    // Save to static file
    await fs.writeFile('bookmarks.json', JSON.stringify(bookmarks, null, 2));
    console.log('Successfully generated bookmarks.json');
  } catch (error) {
    console.error('Error generating bookmarks:', error);
  }
}

generateBookmarksJson(); 