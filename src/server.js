require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const API = require('./routes/API');
const sequelize = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/API', API);

// Sinkronisasi database
sequelize.sync({ force: false }) // force: true untuk mengganti tabel jika ada perubahan
  .then(() => {
    console.log('Database synced');
  })
  .catch((err) => console.error('Error syncing database:', err));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});