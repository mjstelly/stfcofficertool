const fs = require('fs');
const csv = require('csv-parser');
const Firestore = require('@google-cloud/firestore');

// Initialize Firestore
const firestore = new Firestore({
  projectId: 'stfcofficertool',
  keyFilename: '../stfc-firebase.json',
});

// Read CSV and import to Firestore
fs.createReadStream('./csvData/officer_skills.csv') // Replace with the path to your CSV file
  .pipe(csv())
  .on('data', row => {
    // Create a new document with 'Officer' as the ID
    firestore
      .collection('officers')
      .doc(row.Officer)
      .set(row)
      .catch(err => {
        console.error(`Error adding document for Officer ${row.Officer}:`, err);
      });
  })
  .on('end', () => {
    console.log('CSV successfully imported to Firestore');
  });
