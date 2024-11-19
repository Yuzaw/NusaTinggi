const { Storage } = require('@google-cloud/storage');
const path = require('path');

// Inisialisasi Storage dengan kunci JSON
const storage = new Storage({
  keyFilename: path.join(__dirname, './nusatinggi-3f514f398fe8.json'),
  projectId: 'nusatinggi',
});

// Nama bucket Anda
const bucketName = 'nusatinggi';
const bucket = storage.bucket(bucketName);

module.exports = bucket;
