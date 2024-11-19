const multer = require('multer');

const storage = multer.memoryStorage(); // File hanya disimpan di memori
const upload = multer({ storage });

module.exports = upload;