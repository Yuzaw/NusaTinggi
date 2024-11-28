const MyTrip = require('../models/myTrip');
const Product = require('../models/products');

// Melihat daftar pesanan (MyOrders) untuk akun bisnis
const getMyOrders = async (req, res) => {
  const { id: businessOwnerId } = req.user; // ID pemilik bisnis dari token pengguna yang login

  try {
    // Cari semua pesanan terkait dengan akun bisnis berdasarkan businessOwnerId
    const orders = await MyTrip.findAll({
      where: { businessOwnerId }, // Pastikan kita memeriksa kesesuaian businessOwnerId
      include: [
        {
          model: Product,
          attributes: ['title', 'price', 'image'],
        },
      ],
    });

    // Kirimkan respons jika data ditemukan
    res.status(200).json({
      message: 'Orders retrieved successfully',
      orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve orders', error });
  }
};

// Accept an order
const acceptOrder = async (req, res) => {
  const { orderId } = req.params;
  const { id: businessOwnerId } = req.user; // ID pemilik bisnis dari token

  try {
    // Cari pesanan berdasarkan ID order dan pastikan pemilik bisnis sesuai
    const order = await MyTrip.findOne({
      where: { id: orderId, businessOwnerId },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or not authorized' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Order is not in a pending state' });
    }

    // Ubah status order menjadi accepted
    order.status = 'accepted';
    await order.save();

    res.status(200).json({
      message: 'Order accepted successfully',
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to accept the order', error: error.message });
  }
};


// Decline an order
const declineOrder = async (req, res) => {
  const { orderId } = req.params;
  const { id: businessOwnerId } = req.user; // ID pemilik bisnis dari token

  try {
    // Cari pesanan berdasarkan ID order dan pastikan pemilik bisnis sesuai
    const order = await MyTrip.findOne({
      where: { id: orderId, businessOwnerId },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or not authorized' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Order is not in a pending state' });
    }

    // Ubah status order menjadi cancelled
    order.status = 'cancelled';
    order.cancellationReason = 'Order declined by trip owner';
    await order.save();

    res.status(200).json({
      message: 'Order declined successfully',
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to decline the order', error: error.message });
  }
};

module.exports = {
  getMyOrders,
  acceptOrder,
  declineOrder,
};