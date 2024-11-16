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

const getTopRecommendedProducts = (req, res) => {
  // Sort by rating and jumlahPembeli, prioritize high rating, then high jumlahPembeli
  const recommendedProducts = [...products]
    .sort((a, b) => {
      // Sort by rating first, then by jumlahPembeli if ratings are the same
      if (b.rating === a.rating) {
        return b.jumlahPembeli - a.jumlahPembeli;
      }
      return b.rating - a.rating;
    })
    .slice(0, 10); // Get top 10 products

  res.json(recommendedProducts);
};



// Function to increment jumlahPembeli (total buyers) for a product
const incrementJumlahPembeli = (req, res) => {
  const productId = parseInt(req.params.id);
  const product = products.find((p) => p.id === productId);

  if (product) {
    product.jumlahPembeli += 1;
    res.json({ message: 'Purchase recorded', product });
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

// Function to add a rating to a product and update jumlahRating and rating
const addRating = (req, res) => {
  const productId = parseInt(req.params.id);
  const { newRating } = req.body; // Assume newRating is passed in request body
  const product = products.find((p) => p.id === productId);

  if (product && newRating >= 1 && newRating <= 5) {
    // Update jumlahRating and recalculate average rating
    const totalRatingScore = product.rating * product.jumlahRating + newRating;
    product.jumlahRating += 1;
    product.rating = totalRatingScore / product.jumlahRating;

    res.json({ message: 'Rating added', product });
  } else {
    res.status(400).json({ message: 'Invalid rating or product not found' });
  }
};

// Other existing functions (getAllProducts, getProductById, addProduct, etc.)

module.exports = {
  getAllProducts,
  getProductById,
  addProduct,
  getTopRecommendedProducts,
  incrementJumlahPembeli,
  addRating
};

