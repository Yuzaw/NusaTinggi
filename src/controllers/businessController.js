const Product = require('../models/products'); // Import model Product
const User = require('../models/users');
const { v4: uuidv4 } = require('uuid');
const upload = require('../middleware/upload');
const bucket = require('../config/cloudStorage');

// Get all products from the business user
const getMyBusiness = [
  async (req, res) => {
    const { id } = req.user; // Ambil ID pengguna dari token

    try {
      // Cari semua produk yang dimiliki oleh user dengan id bisnis
      const products = await Product.findAll({
        where: {
          userId: id, // Asumsikan produk punya kolom userId untuk mengaitkan produk dengan user
        },
      });

      res.json({ products });
    } catch (err) {
      res.status(500).json({ message: 'Error fetching products', error: err.message });
    }
  },
];

// Get a product by id from the business user
const getMyBusinessById = [
  async (req, res) => {
    const { id } = req.user; // Ambil ID pengguna dari token
    const { productId } = req.params; // Ambil productId dari parameter URL

    try {
      // Cari produk berdasarkan id produk dan userId
      const product = await Product.findOne({
        where: {
          id: productId,
          userId: id, // Hanya dapatkan produk yang dimiliki oleh user dengan id ini
        },
      });

      if (!product) {
        return res.status(404).json({ message: 'Product not found for your business' });
      }

      res.json({ product });
    } catch (err) {
      res.status(500).json({ message: 'Error fetching product', error: err.message });
    }
  },
];


// Add a new product (only for business users)
const addProduct = [
  upload.single('image'), // Middleware for handling file upload
  async (req, res) => {
    const { title, description, rating, price } = req.body;
    const { id: userId } = req.user; // Get the userId from the token

    // Validate body data
    if (!title || !description || !rating || !price) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    try {
      // Get the user data from the database using userId
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const productId = uuidv4(); // Generate a unique productId
      let imageUrl = null;

      // If an image is uploaded
      if (req.file) {
        const folderName = `users/userId-${userId}/products/productId-${productId}/`; // New folder structure with userId and productId
        const fileName = `${Date.now()}-${req.file.originalname}`;
        const filePath = `${folderName}${fileName}`;

        const file = bucket.file(filePath);
        const stream = file.createWriteStream({
          resumable: false,
          contentType: req.file.mimetype,
          predefinedAcl: 'publicRead',
        });

        await new Promise((resolve, reject) => {
          stream.on('finish', resolve);
          stream.on('error', reject);
          stream.end(req.file.buffer);
        });

        imageUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
      }

      // Create a new product in the database
      const newProduct = await Product.create({
        id: productId,
        image: imageUrl,
        title,
        description,
        rating,
        price,
        userId, // Store userId to associate the product with the user
      });

      res.status(201).json(newProduct);
    } catch (err) {
      res.status(500).json({ message: 'Error adding product', error: err.message });
    }
  },
];


// Edit a product (only for business users)
const editProduct = [
  upload.single('image'),
  async (req, res) => {
    const { productId } = req.params; // Get the productId from the URL parameters
    const { title, description, rating, price } = req.body;
    const { id: userId } = req.user; // Get the userId from the token

    try {
      // Get the user data from the database using userId
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Find the product by productId and userId
      const product = await Product.findOne({
        where: {
          id: productId,
          userId, // Only allow editing if the product belongs to this user
        },
      });

      if (!product) {
        return res.status(404).json({ message: 'Product not found or not owned by you' });
      }

      let imageUrl = product.image;
      const updatedTitle = title || product.title; // Use the new title if provided, otherwise keep the old one

      if (req.file) {
        // Delete the old image from Cloud Storage (if any)
        if (product.image) {
          const oldFilePath = product.image.replace(`https://storage.googleapis.com/${bucket.name}/`, '');
          const oldFile = bucket.file(oldFilePath);
          await oldFile.delete();
        }

        // Upload the new image to Cloud Storage
        const folderName = `users/userId-${userId}/products/productId-${productId}/`; // New folder structure with userId and productId
        const fileName = `${Date.now()}-${req.file.originalname}`;
        const filePath = `${folderName}${fileName}`;

        const file = bucket.file(filePath);
        const stream = file.createWriteStream({
          resumable: false,
          contentType: req.file.mimetype,
          predefinedAcl: 'publicRead',
        });

        await new Promise((resolve, reject) => {
          stream.on('finish', resolve);
          stream.on('error', reject);
          stream.end(req.file.buffer);
        });

        imageUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
      }

      // Update product details
      product.title = updatedTitle;
      product.description = description || product.description;
      product.rating = rating || product.rating;
      product.price = price || product.price;
      product.image = imageUrl;

      await product.save();

      res.json({ message: 'Product updated successfully', product });
    } catch (err) {
      res.status(500).json({ message: 'Error updating product', error: err.message });
    }
  },
];


// Delete a product (only for business users)
const deleteProduct = [
  async (req, res) => {
    const { productId } = req.params; // Dapatkan parameter productId
    const { id: userId } = req.user; // Ambil ID pengguna dari token

    try {
      // Cari produk berdasarkan id dan userId
      const product = await Product.findOne({
        where: {
          id: productId,
          userId, // Hanya hapus jika produk milik user ini
        },
      });

      if (!product) {
        return res.status(404).json({ message: 'Product not found or not owned by you' });
      }

      // Hapus gambar dari Cloud Storage (jika ada)
      if (product.image) {
        const filePath = product.image.replace(`https://storage.googleapis.com/${bucket.name}/`, '');
        const file = bucket.file(filePath);
        await file.delete();
      }

      // Hapus produk dari database
      await product.destroy();

      res.json({ message: 'Product and associated image deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting product', error: err.message });
    }
  },
];

module.exports = {
  getMyBusiness,
  getMyBusinessById,
  addProduct,
  editProduct,
  deleteProduct,
};
