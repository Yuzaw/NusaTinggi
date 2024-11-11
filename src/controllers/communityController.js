const notes = require('../models/community'); // Import array notes

// Mendapatkan semua catatan
exports.getAllNotes = (req, res) => {
  res.status(200).json(notes); // Mengembalikan semua catatan dalam bentuk JSON
};

// Menambahkan catatan baru
exports.createNote = (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required' });
  }

  // Membuat catatan baru
  const newNote = {
    id: notes.length + 1, // ID untuk catatan baru, menggunakan panjang array
    title,
    description
  };

  // Menambahkan catatan baru ke array notes
  notes.push(newNote);

  res.status(201).json({ message: 'Note created successfully', note: newNote });
};