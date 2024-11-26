require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const API = require('./routes/API');
const syncDatabase = require('./config/syncDatabase');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/API', API);

// Panggil sinkronisasi database
syncDatabase()
  .then(() => console.log('All tables synced successfully'))
  .catch((err) => console.error('Error during table sync:', err));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});