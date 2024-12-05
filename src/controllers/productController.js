// controllers/productController.js
const Product = require('../models/products'); // Import the Sequelize model

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

module.exports = {
  getAllProducts,
  getProductById,
  getTopRecommendedProducts,
};