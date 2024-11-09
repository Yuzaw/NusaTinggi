const express = require('express');
const app = express();
const port = 3000;

// Middleware untuk parsing JSON
app.use(express.json());

// Data contoh
const items = [
  { id: 1, name: 'Item 1', description: 'Description of Item 1' },
  { id: 2, name: 'Item 2', description: 'Description of Item 2' }
];

// Endpoint GET untuk mengambil semua items
app.get('/api/items', (req, res) => {
  res.json(items);
});

// Endpoint GET untuk mengambil item berdasarkan ID
app.get('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const item = items.find((i) => i.id === id);
  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ message: 'Item not found' });
  }
});

// Endpoint POST untuk membuat item baru
app.post('/api/items', (req, res) => {
  const newItem = {
    id: items.length + 1,
    name: req.body.name,
    description: req.body.description
  };
  items.push(newItem);
  res.status(201).json(newItem);
});

// Endpoint PUT untuk memperbarui item berdasarkan ID
app.put('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const item = items.find((i) => i.id === id);
  if (item) {
    item.name = req.body.name;
    item.description = req.body.description;
    res.json(item);
  } else {
    res.status(404).json({ message: 'Item not found' });
  }
});

// Endpoint DELETE untuk menghapus item berdasarkan ID
app.delete('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const itemIndex = items.findIndex((i) => i.id === id);
  if (itemIndex !== -1) {
    items.splice(itemIndex, 1);
    res.status(204).end();
  } else {
    res.status(404).json({ message: 'Item not found' });
  }
});

// Menjalankan server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
