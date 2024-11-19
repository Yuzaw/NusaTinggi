// controllers/productController.js
const Product = require('../models/product'); // Import the Sequelize model

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
  const productId = parseInt(req.params.id);
  try {
    const product = await Product.findByPk(productId);
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

  // Simple validation
  if (!image || !title || !description || !rating || !price) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newProduct = await Product.create({
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
  getTopRecommendedProducts,
  incrementJumlahPembeli,
  addRating,
};
