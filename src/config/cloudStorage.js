const { Storage } = require('@google-cloud/storage');
require('dotenv').config();

// Inisialisasi Storage dengan kunci JSON
const storage = new Storage({
  projectId: 'nusatinggi',
});

// Nama bucket Anda
const bucketName = 'nusatinggi';
const bucket = storage.bucket(bucketName);

module.exports = bucket;
