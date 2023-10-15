const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Firestore = require('@google-cloud/firestore');

// Initialize Firestore
const firestore = new Firestore({
  projectId: 'stfcofficertool',
  keyFilename: '../stfc-firebase.json',
});

// Function to import a single CSV file to Firestore
const importCsvToFirestore = (filePath, collectionName) => {
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', row => {
      const docId = row.ID || row.id || row.Id;
      if (docId) {
        firestore
          .collection(collectionName)
          .doc(docId)
          .set(row)
          .catch(err => {
            console.error(`Error adding document for ${collectionName}:`, err);
          });
      } else {
        console.warn(`Skipping row due to missing ID: ${JSON.stringify(row)}`);
      }
    })
    .on('end', () => {
      console.log(`${filePath} successfully imported to Firestore`);

      // Move file to /imported directory
      const newFilePath = path.join('./imported', path.basename(filePath));
      fs.rename(filePath, newFilePath, err => {
        if (err) {
          console.error(`Error moving file: ${err}`);
        } else {
          console.log(`Moved file to ${newFilePath}`);
        }
      });
    });
};

// Read all files in the ./stfcdata directory
fs.readdir('./stfcdata', (err, files) => {
  if (err) {
    return console.error(`Unable to read directory: ${err}`);
  }

  // Iterate over each file and import to Firestore
  files.forEach(file => {
    const filePath = path.join('./stfcdata', file);
    const collectionName = path.basename(file, path.extname(file)); // Remove the file extension for the collection name

    // Only process CSV files
    if (path.extname(file) === '.csv') {
      importCsvToFirestore(filePath, collectionName);
    }
  });
});
