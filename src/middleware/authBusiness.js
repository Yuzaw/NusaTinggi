const User = require('../models/users'); // Import model User

const authBusiness = async (req, res, next) => {
  const { id } = req.user; // Ambil ID pengguna dari token

  try {
    // Cari pengguna berdasarkan ID
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Periksa apakah status pengguna adalah 'business'
    if (user.status !== 'business') {
      return res.status(403).json({ message: 'You must be a business user to perform this action' });
    }

    // Jika status 'business', lanjutkan ke handler berikutnya
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error verifying user status', error: error.message });
  }
};

module.exports = authBusiness;
