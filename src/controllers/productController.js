// controllers/productController.js
const Product = require('../models/product'); // Import the Sequelize model

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
const addProduct = async (req, res) => {
  const { image, title, description, rating, price } = req.body;

  if (!image || !title || !description || !rating || !price) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newProduct = await Product.create({
      id: uuidv4(), // ID acak
      image,
      title,
      description,
      rating,
      price,
    });

    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ message: 'Error adding product', error: err.message });
  }
};

// Edit a product by ID
const editProduct = async (req, res) => {
  const productId = parseInt(req.params.id);
  const { image, title, description, rating, price } = req.body;

  try {
    const product = await Product.findByPk(productId);
    if (product) {
      // Update the product fields
      product.image = image || product.image;
      product.title = title || product.title;
      product.description = description || product.description;
      product.rating = rating || product.rating;
      product.price = price || product.price;

      await product.save(); // Simpan perubahan
      res.json({ message: 'Product updated successfully', product });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error updating product', error: err.message });
  }
};

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

    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
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