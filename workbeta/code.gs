// Set this to your Google Sheet ID
const SHEET_ID = '1wJUC_pM_IAbuv8aKkmvMhThLe_ulZ-VmcBiSNxlrnOk';
const SHEET_NAME = 'Hospital Bookmarks';
const ADMIN_PASSWORD = 'password'; // Add your desired admin password here

function doGet(e) {
  // Add logging to debug the request
  Logger.log('Received request with parameters:', e.parameter);
  
  // Handle admin actions if present
  if (e && e.parameter && e.parameter.action) {
    Logger.log('Action detected:', e.parameter.action);
    
    if (e.parameter.action === 'login') {
      // Return only the login response
      const providedPassword = e.parameter.password;
      Logger.log('Password provided:', providedPassword); // For debugging
      Logger.log('Expected password:', ADMIN_PASSWORD); // For debugging
      Logger.log('Match result:', providedPassword === ADMIN_PASSWORD); // For debugging
      
      const response = {
        type: 'login',  // Add a type field to distinguish response types
        success: providedPassword === ADMIN_PASSWORD,
        message: providedPassword === ADMIN_PASSWORD ? 'Login successful' : 'Invalid password'
      };
      
      return ContentService.createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders({
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*'
        });
    } 
    else if (e.parameter.action === 'refresh') {
      return handleRefresh();
    }
  }

  // Default behavior: return bookmarks
  const output = getBookmarks();
  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Cache-Control': 'public, max-age=300',
      'Access-Control-Allow-Origin': '*'
    });
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
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*'
    });
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Refresh failed: ' + error.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*'
    });
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

function getBookmarks() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const bookmarks = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const bookmark = {
      Category: row[headers.indexOf('Category')],
      Name: row[headers.indexOf('Name')],
      URL: row[headers.indexOf('URL')],
      type: row[headers.indexOf('Type')] || 'link'
    };

    // Handle dropdown links
    if (bookmark.type === 'dropdown') {
      try {
        bookmark.links = JSON.parse(row[headers.indexOf('Links')] || '[]');
      } catch (e) {
        bookmark.links = [];
      }
    }

    bookmarks.push(bookmark);
  }

  return bookmarks;  // Return just the array
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