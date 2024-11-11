// controllers/productController.js

const products = require('../models/product');

// Get all products
const getAllProducts = (req, res) => {
  res.json(products);
};

// Get a specific product by ID
const getProductById = (req, res) => {
  const productId = parseInt(req.params.id);
  const product = products.find((p) => p.id === productId);

  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

// Add a new product
const addProduct = (req, res) => {
  const { image, title, description, rating, price } = req.body;

  // Simple validation
  if (!image || !title || !description || !rating || !price) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Create new product object
  const newProduct = {
    id: products.length + 1, // Simple ID generation
    image,
    title,
    description,
    rating,
    price
  };

  // Add the new product to the list
  products.push(newProduct);

  // Respond with the newly added product
  res.status(201).json(newProduct);
};

const getTopRatedProducts = (req, res) => {
  // Sort products by rating in descending order and take the top 6
  const topRated = [...products]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10);

  // Return the top-rated products
  res.json(topRated);
};

module.exports = {
  getAllProducts,
  getProductById,
  addProduct,
  getTopRatedProducts
};
