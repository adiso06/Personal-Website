// Configuration constants
const SHEET_ID = '1wJUC_pM_IAbuv8aKkmvMhThLe_ulZ-VmcBiSNxlrnOk';
const SHEET_NAME = 'Hospital Bookmarks';
const SETTINGS_SHEET_NAME = 'Settings';
const ANNOUNCEMENT_CELL = 'B1';
const ADMIN_PASSWORD = 'password'; // Add your desired admin password here

// Standard headers for all responses (cannot be applied to TextOutput)
// const CORS_HEADERS = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
//   'Access-Control-Allow-Headers': 'Content-Type',
//   'Content-Type': 'application/json',
//   'Cache-Control': 'no-store, no-cache, must-revalidate',
//   'Pragma': 'no-cache',
//   'Expires': '0'
// };

function createResponse(data, success = true, error = null) {
  const response = {
    success: success,
    timestamp: new Date().getTime()
  };

  if (success) {
    Object.assign(response, data);
  } else {
    response.error = error.toString();
    console.error('Error in response:', error);
  }

  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSettingsSheet() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SETTINGS_SHEET_NAME);
    if (!sheet) {
      throw new Error(`Settings sheet "${SETTINGS_SHEET_NAME}" not found`);
    }
    return sheet;
  } catch (error) {
    console.error('Error accessing Settings sheet:', error);
    throw error;
  }
}

function getBookmarksSheet() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error(`Bookmarks sheet "${SHEET_NAME}" not found`);
    }
    return sheet;
  } catch (error) {
    console.error('Error accessing Bookmarks sheet:', error);
    throw error;
  }
}

function getAnnouncement() {
  try {
    const sheet = getSettingsSheet();
    // Get only the announcement value
    const announcement = sheet.getRange(ANNOUNCEMENT_CELL).getValue().toString();
    
    // Log the value we're about to return
    console.log('Sending announcement:', announcement);
    
    // Return ONLY the announcement data
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      announcement: announcement,
      timestamp: new Date().getTime()
    }))
    .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error('Error fetching announcement:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString(),
      timestamp: new Date().getTime()
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

function getBookmarks() {
  try {
    const sheet = getBookmarksSheet();
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const bookmarks = data.slice(1).map(row => {
      const bookmark = {
        Category: row[headers.indexOf('Category')] || '',
        Name: row[headers.indexOf('Name')] || '',
        URL: row[headers.indexOf('URL')] || '',
        Type: row[headers.indexOf('Type')] || 'link'
      };

      if (bookmark.Type === 'dropdown') {
        const linksStr = row[headers.indexOf('Links')] || '[]';
        try {
          bookmark.Links = JSON.parse(linksStr);
          if (!Array.isArray(bookmark.Links)) {
            bookmark.Links = [];
          }
        } catch (e) {
          console.warn(`Failed to parse Links for ${bookmark.Name}:`, e);
          bookmark.Links = [];
        }
      }

      return bookmark;
    });

    return bookmarks;
  } catch (error) {
    throw new Error(`Failed to fetch bookmarks: ${error.message}`);
  }
}

function doGet(e) {
  console.log('Received GET request with parameters:', e.parameter);

  // Add validation for the event object
  if (!e || !e.parameter || !e.parameter.action) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'No action specified'
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }

  // Handle announcement request
  if (e.parameter.action === 'getAnnouncement') {
    return getAnnouncement();
  }

  // Handle refresh request
  if (e.parameter.action === 'refresh') {
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: getBookmarks()
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }

  // Invalid action
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    error: 'Invalid action specified'
  }))
  .setMimeType(ContentService.MimeType.JSON);
}

function handleRefresh() {
  try {
    // Clear cache by returning fresh data
    const bookmarks = getBookmarks();
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Refresh successful',
      data: bookmarks
    }))
    .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Refresh failed: ' + error.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  // Add validation for the event object
  if (!e) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'No request data received'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    // First try to get data from postData
    if (e.postData && e.postData.contents) {
      Logger.log('Received POST data:', e.postData.contents);
      const postData = JSON.parse(e.postData.contents);
      
      if (postData.action === 'delete') {
        return deleteBookmark(postData.url);
      } else {
        return addBookmark(postData);
      }
    }
    
    // Fallback to parameter data if postData is not available
    const formData = e.parameter;
    if (formData) {
      if (formData.action === 'delete') {
        return deleteBookmark(formData.url);
      } else {
        return addBookmark(formData);
      }
    }

    // If no data was found in either location
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'No valid data found in request'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error in doPost:', error);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Error processing request: ' + error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function addBookmark(data) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  
  // Log the incoming data
  Logger.log('Adding bookmark with data:', data);

  let links = '';
  if (data.type === 'dropdown' && data.links) {
    // If links is already a string, use it; otherwise, stringify it
    links = typeof data.links === 'string' ? data.links : JSON.stringify(data.links);
  }

  const newRow = [
    data.category || data.Category,
    data.name || data.Name,
    data.url || data.URL || '',
    data.type || 'link',
    links
  ];

  sheet.appendRow(newRow);
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Bookmark added successfully'
  })).setMimeType(ContentService.MimeType.JSON);
}

function deleteBookmark(identifier) {
  if (!identifier) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'No identifier provided for deletion'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  let deleted = false;

  // Find the row to delete (match by URL or Name)
  for (let i = data.length - 1; i >= 1; i--) {
    const row = data[i];
    if (row[headers.indexOf('URL')] === identifier || 
        row[headers.indexOf('Name')] === identifier) {
      sheet.deleteRow(i + 1);
      deleted = true;
      break;
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: deleted ? 'success' : 'error',
    message: deleted ? 'Bookmark deleted successfully' : 'Bookmark not found'
  })).setMimeType(ContentService.MimeType.JSON);
}

// Utility function to validate URLs
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

// Setup function to create the initial sheet structure
function setup() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  
  // Set up headers
  const headers = ['Category', 'Name', 'URL', 'Type', 'Links'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Optional: Format headers
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#f3f3f3');
}

function onEdit(e) {
  // Check if the edit was made in the correct sheet
  if (e.source.getSheetName() === SHEET_NAME) {
    // Call generate-bookmarks functionality via webhook
    const GITHUB_REPO = 'adiso06/Personal-Website/';
    const GITHUB_TOKEN = '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'; // Store this securely
    
    const url = `https://api.github.com/repos/${GITHUB_REPO}/dispatches`;
    
    const options = {
      'method': 'post',
      'headers': {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      'payload': JSON.stringify({
        'event_type': 'google_sheets_update'
      })
    };
    
    try {
      UrlFetchApp.fetch(url, options);
    } catch (error) {
      console.error('Failed to trigger GitHub action:', error);
    }
  }
}