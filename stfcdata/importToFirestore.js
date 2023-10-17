const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Firestore = require('@google-cloud/firestore');

const firestore = new Firestore({
  projectId: 'stfcofficertool', // Replace with your project ID
  keyFilename: '../.secret/stfc-firebase.json', // Replace with your key file path
});

console.log('Starting script...');

const importCsvToFirestore = filePath => {
  const fileName = path.basename(filePath);
  const collectionName = fileName.split('.').slice(0, -1).join('.');
  console.log(`Processing file: ${filePath}`);

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', row => {
        const idField = Object.keys(row).find(key => key.endsWith('_id'));
        if (idField && row[idField]) {
          firestore
            .collection(collectionName)
            .doc(row[idField])
            .set(row)
            .catch(err => {
              console.error(`Error adding document ${row[idField]}: ${err}`);
            });
        } else {
          console.warn(
            `Skipping row due to missing ID: ${JSON.stringify(row)}`,
          );
        }
      })
      .on('end', () => {
        resolve();
      })
      .on('error', error => {
        reject(error);
      });
  });
};

fs.readdir('./', (err, files) => {
  if (err) {
    console.error('Unable to read directory:', err);
    return;
  }

  const csvFiles = files.filter(
    file => path.extname(file).toLowerCase() === '.csv',
  );
  const importPromises = csvFiles.map(file =>
    importCsvToFirestore(path.join('./', file)),
  );

  Promise.all(importPromises)
    .then(() => {
      console.log('CSV files successfully imported to Firestore');
      csvFiles.forEach(file => {
        fs.rename(path.join('./', file), path.join('./imported', file), err => {
          if (err) {
            console.error(`Error moving file: ${err}`);
          }
        });
      });
    })
    .catch(error => {
      console.error('Error importing CSV files:', error);
    });
});
