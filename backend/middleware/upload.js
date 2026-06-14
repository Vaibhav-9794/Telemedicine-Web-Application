const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const UPLOAD_DIR = path.join(__dirname, '../public/uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Saves a base64 encoded file string to the uploads directory.
 * @param {string} base64String - Data URI string (e.g. data:application/pdf;base64,...)
 * @param {string} originalName - Name of the file uploaded
 * @returns {object} { fileName, fileUrl }
 */
const saveBase64File = (base64String, originalName) => {
  try {
    // Check if it's a data URI
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer;
    let ext = path.extname(originalName) || '.pdf';

    if (matches && matches.length === 3) {
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      // Fallback if it's just a raw base64 string
      buffer = Buffer.from(base64String, 'base64');
    }

    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    fs.writeFileSync(filePath, buffer);

    return {
      fileName: originalName,
      fileUrl: `/uploads/${filename}`
    };
  } catch (error) {
    console.error('Error in saveBase64File:', error);
    throw new Error('Failed to save uploaded file');
  }
};

module.exports = {
  saveBase64File
};
