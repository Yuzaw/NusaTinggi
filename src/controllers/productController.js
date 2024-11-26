// controllers/productController.js
const Product = require('../models/products'); // Import the Sequelize model
const upload = require('../middleware/upload');
const bucket = require('../config/cloudStorage');

const { v4: uuidv4 } = require('uuid');
const { v4: isUuid } = require('uuid');

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products', error: err.message });
  }
};

// Get a specific product by ID
const getProductById = async (req, res) => {
  const productId = req.params.id; // Mengambil ID langsung dari parameter

  // Validasi apakah ID berupa string non-kosong
  if (!productId || typeof productId !== 'string') {
    return res.status(400).json({ message: 'Invalid product ID' });
  }

  try {
    const product = await Product.findByPk(productId); // Query menggunakan UUID
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error fetching product', error: err.message });
  }
};

// Add a new product
const addProduct = [
  upload.single('image'), // Middleware untuk menangani file gambar
  async (req, res) => {
    const { title, description, rating, price } = req.body;

    // Validasi data body
    if (!title || !description || !rating || !price) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    try {
      // Generate ID untuk produk
      const productId = uuidv4();
      console.log('Generated Product ID:', productId); // Tambahkan log untuk memeriksa nilai ID

      let imageUrl = null;

      // Jika file gambar diunggah
      if (req.file) {
        const folderName = `products/${productId}/`; // Folder berdasarkan ID produk
        const fileName = `${Date.now()}-${req.file.originalname}`;
        const filePath = `${folderName}${fileName}`;

        const file = bucket.file(filePath);

        const stream = file.createWriteStream({
          resumable: false,
          contentType: req.file.mimetype,
          predefinedAcl: 'publicRead', // Memberikan akses publik
        });

        stream.on('error', (err) => {
          console.error('Error uploading image:', err);
          return res.status(500).json({ message: 'Error uploading image' });
        });

        await new Promise((resolve, reject) => {
          stream.on('finish', resolve);
          stream.on('error', reject);
          stream.end(req.file.buffer);
        });

        imageUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
      }

      // Buat produk baru di database
      const newProduct = await Product.create({
        id: productId, // ID produk digunakan di folder
        image: imageUrl, // URL gambar dari Google Cloud Storage
        title,
        description,
        rating,
        price,
      });

      res.status(201).json(newProduct);
    } catch (err) {
      console.error('Error adding product:', err);
      res.status(500).json({ message: 'Error adding product', error: err.message });
    }
  },
];

// Edit a product by ID
const editProduct = [
  upload.single('image'), // Middleware untuk menangani file gambar (satu file)
  async (req, res) => {
    const productId = req.params.id; // Ambil ID produk dari parameter
    const { title, description, rating, price } = req.body;

    try {
      const product = await Product.findByPk(productId); // Cari produk berdasarkan ID
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Jika ada gambar baru
      let imageUrl = product.image; // Jika tidak ada gambar baru, gunakan gambar lama

      if (req.file) {
        // Menghapus gambar lama dari Cloud Storage (jika ada)
        if (product.image) {
          const oldFilePath = product.image.replace(`https://storage.googleapis.com/${bucket.name}/`, '');
          const oldFile = bucket.file(oldFilePath);

          await oldFile.delete(); // Hapus file gambar lama
        }

        // Upload gambar baru ke Cloud Storage
        const folderName = `products/${productId}/`; // Gunakan folder yang sama dengan ID produk
        const fileName = `${Date.now()}-${req.file.originalname}`; // Nama file baru untuk menghindari duplikasi
        const filePath = `${folderName}${fileName}`; // Path lengkap file

        const file = bucket.file(filePath);

        const stream = file.createWriteStream({
          resumable: false,
          contentType: req.file.mimetype,
          predefinedAcl: 'publicRead', // Berikan akses publik
        });

        await new Promise((resolve, reject) => {
          stream.on('finish', resolve);
          stream.on('error', reject);
          stream.end(req.file.buffer); // Kirim buffer file ke Cloud Storage
        });

        // URL gambar baru dari Cloud Storage
        imageUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
      }

      // Update data produk di database
      product.title = title || product.title;
      product.description = description || product.description;
      product.rating = rating || product.rating;
      product.price = price || product.price;
      product.image = imageUrl; // Perbarui URL gambar

      await product.save(); // Simpan perubahan

      res.json({ message: 'Product updated successfully', product });
    } catch (err) {
      console.error('Error updating product:', err);
      res.status(500).json({ message: 'Error updating product', error: err.message });
    }
  }
];

// Delete a product by ID
const deleteProduct = async (req, res) => {
  const productId = req.params.id;

  // Validasi apakah ID valid
  if (!productId || !isUuid(productId)) {
    return res.status(400).json({ message: 'Invalid product ID' });
  }

  try {
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete the image from Google Cloud Storage if it exists
    if (product.image) {
      const filePath = product.image.replace(`https://storage.googleapis.com/${bucket.name}/`, ''); // Extract the file path
      const file = bucket.file(filePath); // Get the file reference in Cloud Storage

      await file.delete(); // Delete the file from Cloud Storage
      console.log('Image deleted from Cloud Storage');
    }

    // Now delete the product from the database
    await product.destroy();
    res.json({ message: 'Product and associated image deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ message: 'Error deleting product', error: err.message });
  }
};

// Get top recommended products (sorted by rating and jumlahPembeli)
const getTopRecommendedProducts = async (req, res) => {
  try {
    const recommendedProducts = await Product.findAll({
      order: [
        ['rating', 'DESC'],
        ['jumlahPembeli', 'DESC']
      ],
      limit: 10,
    });

    res.json(recommendedProducts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching recommended products', error: err.message });
  }
};

// Increment jumlahPembeli for a product
const incrementJumlahPembeli = async (req, res) => {
  const productId = parseInt(req.params.id);
  try {
    const product = await Product.findByPk(productId);
    if (product) {
      product.jumlahPembeli += 1;
      await product.save(); // Save the updated product
      res.json({ message: 'Purchase recorded', product });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error updating purchase count', error: err.message });
  }
};

// Add a rating to a product and update rating and jumlahRating
const addRating = async (req, res) => {
  const productId = parseInt(req.params.id);
  const { newRating } = req.body; // Assume newRating is passed in request body

  if (newRating < 1 || newRating > 5) {
    return res.status(400).json({ message: 'Invalid rating value' });
  }

  try {
    const product = await Product.findByPk(productId);
    if (product) {
      const totalRatingScore = product.rating * product.jumlahRating + newRating;
      product.jumlahRating += 1;
      product.rating = totalRatingScore / product.jumlahRating;

      await product.save(); // Save the updated product
      res.json({ message: 'Rating added', product });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error updating rating', error: err.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  addProduct,
  editProduct,
  deleteProduct,
  getTopRecommendedProducts,
  incrementJumlahPembeli,
  addRating,
};