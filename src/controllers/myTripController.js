const MyTrip = require('../models/myTrip');
const Product = require('../models/products');
const User = require('../models/users');

// Melihat daftar MyTrip pengguna
const getMyTrips = async (req, res) => {
  const { id } = req.user;

  try {
    const trips = await MyTrip.findAll({
      where: { userId: id },
      include: [
        { model: Product, as: 'Product', attributes: ['title', 'price', 'image'] },
      ],
    });

    res.status(200).json({
      message: 'MyTrips retrieved successfully',
      trips,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve MyTrips', error });
  }
};

// Membeli produk (menambah ke MyTrip)
const buyProduct = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const { id: buyerId } = req.user; // ID pembeli

  try {
    // Cari produk berdasarkan productId
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Hitung total harga berdasarkan jumlah dan harga produk
    const totalPrice = product.price * quantity;

    // Buat entri MyTrip dengan menyertakan pemilik produk (userId pemilik bisnis)
    const trip = await MyTrip.create({
      productId,
      userId: buyerId, // ID pembeli
      businessOwnerId: product.userId, // ID pemilik bisnis (dari tabel produk)
      quantity,
      totalPrice,
      status: 'pending',
    });

    res.status(201).json({
      message: 'Product added to MyTrip',
      trip,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to add product to MyTrip', error });
  }
};


// Membatalkan trip
const cancelOrder = async (req, res) => {
  const { myTripId } = req.params;
  const { id } = req.user;  // Ambil id dari token (req.user)

  try {
    // Find the user by id to get the username
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const username = user.username;  // Ambil username dari user yang ditemukan

    // Find the MyTrip entry by myTripId and userId
    const trip = await MyTrip.findOne({
      where: { id: myTripId, userId: id },
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // If the trip is already cancelled, return a message
    if (trip.status === 'cancelled') {
      return res.status(400).json({ message: 'Trip is already cancelled' });
    }

    // Set the trip status to 'cancelled' and provide a reason using username
    trip.status = 'cancelled';
    trip.cancellationReason = `Order cancelled by ${username}`;
    await trip.save();

    res.status(200).json({
      message: 'Trip cancelled successfully',
      trip,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to cancel the trip', error });
  }
};

// Menyelesaikan trip
const completeOrder = async (req, res) => {
  const { myTripId } = req.params;
  const { id } = req.user;  // Ambil id dari token (req.user)

  try {
    // Find the MyTrip entry by myTripId and userId
    const trip = await MyTrip.findOne({
      where: { id: myTripId, userId: id },
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // If the trip is already completed, return a message
    if (trip.status === 'completed') {
      return res.status(400).json({ message: 'Trip is already completed' });
    }

    // Set the trip status to 'completed'
    trip.status = 'completed';
    await trip.save();

    res.status(200).json({
      message: 'Trip completed successfully',
      trip,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to complete the trip', error });
  }
};

module.exports = {
  buyProduct,
  getMyTrips,
  cancelOrder,
  completeOrder,
};
