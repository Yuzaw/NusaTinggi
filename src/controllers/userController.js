const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/users');
const { Sequelize } = require('sequelize');
const upload = require('../middleware/upload');
const bucket = require('../config/cloudStorage');

const SECRET_KEY = process.env.SECRET_KEY;

// Register
const register = async (req, res) => {
  const { username, email, password, gender, dateOfBirth } = req.body;

  // Validasi username dan email (tidak boleh ada spasi atau karakter lain selain . dan _)
  const usernameRegex = /^[a-zA-Z0-9._]+$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!usernameRegex.test(username)) {
    return res.status(400).json({ message: 'Username can only contain letters, numbers, ".", and "_" (no spaces or special characters allowed)' });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    // Periksa apakah user sudah ada
    const existingUser = await User.findOne({
      where: { [Sequelize.Op.or]: [{ username }, { email }] },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this username or email already exists' });
    }

    // Hash password dan simpan ke database
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username, email, password: hashedPassword, gender, dateOfBirth
    });

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error registering user' });
  }
};

// Login
const login = async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  try {
    // Cari user berdasarkan username atau email
    const user = await User.findOne({
      where: {
        [Sequelize.Op.or]: [
          { username: usernameOrEmail },
          { email: usernameOrEmail }
        ]
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Periksa password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token dengan ID pengguna
    const accessToken = jwt.sign(
      { id: user.id }, // Gunakan id sebagai payload
      SECRET_KEY,
      { expiresIn: '30d' }
    );

    res.cookie('token', accessToken, { httpOnly: true, secure: true });
    res.status(200).json({ message: 'Login successful, token set in cookie' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error logging in' });
  }
};

// Logout
const logout = (req, res) => {
  try {
    // Hapus token yang ada di cookies
    res.clearCookie('token', { httpOnly: true, secure: true }); // Pastikan untuk menyesuaikan pengaturan cookie

    res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error logging out' });
  }
};

// Get Profile by ID
const getProfile = async (req, res) => {
  const { id } = req.user; // Ambil ID dari token

  try {
    // Ambil user berdasarkan ID
    const user = await User.findByPk(id, {
      attributes: ['id', 'username', 'email', 'gender', 'dateOfBirth', 'profilePicture'],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving user profile' });
  }
};

// Change Password
const changePassword = async (req, res) => {
  const { id } = req.user; // Ambil ID dari token
  const { oldPassword, newPassword } = req.body;

  try {
    // Cari user berdasarkan ID
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Periksa password lama
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    // Hash password baru dan update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating password' });
  }
};

// Update Profile
const updateProfile = async (req, res) => {
  const { username, gender, dateOfBirth } = req.body;
  const { id } = req.user; // Ambil ID dari token

  try {
    // Cek apakah username baru sudah ada
    if (username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser && existingUser.id !== id) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
    }

    // Cari user berdasarkan ID
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update data profil
    if (username) user.username = username;
    if (gender) user.gender = gender;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;

    // Simpan perubahan ke database
    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        username: user.username,
        email: user.email,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// Upload profile picture
const uploadProfilePicture = [
  upload.single('profilePicture'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { id } = req.user; // Get user ID from the token

      // Retrieve user data from the database
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // If the user already has a profile picture, delete the old one
      if (user.profilePicture) {
        const oldFilePath = user.profilePicture.replace(`https://storage.googleapis.com/${bucket.name}/`, '');
        await bucket.file(oldFilePath).delete().catch((err) => {
          console.error('Error deleting old profile picture:', err);
        });
      }

      // New folder structure with userId
      const folderName = `users/userId-${id}/profile-picture/`;

      // Unique file name to avoid duplication
      const fileName = `${Date.now()}-${req.file.originalname}`;

      // Combine folder and file name to create the path
      const filePath = `${folderName}${fileName}`;
      const file = bucket.file(filePath);

      const stream = file.createWriteStream({
        resumable: false,
        contentType: req.file.mimetype,
        predefinedAcl: 'publicRead',
      });

      stream.on('error', (err) => {
        console.error(err);
        return res.status(500).json({ message: 'Error uploading file' });
      });

      stream.on('finish', async () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
        user.profilePicture = publicUrl;
        await user.save();

        res.status(200).json({
          message: 'Profile picture uploaded successfully',
          profilePicture: publicUrl,
        });
      });

      stream.end(req.file.buffer);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error uploading profile picture' });
    }
  },
];

// Update user status to 'business'
const upgradeToBusiness = async (req, res) => {
  const { id } = req.user; // Ambil ID pengguna dari token

  try {
    // Cari pengguna berdasarkan ID
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Jika pengguna sudah memiliki status 'business', beri respon
    if (user.status === 'business') {
      return res.status(400).json({ message: 'User is already a business' });
    }

    // Ubah status pengguna menjadi 'business'
    user.status = 'business';
    await user.save();

    res.status(200).json({ message: 'User status updated to business', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error upgrading user status', error: error.message });
  }
};

// Delete Account
const deleteAccount = async (req, res) => {
  const { id } = req.user; // Ambil ID dari token

  try {
    // Cari user berdasarkan ID
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hapus semua file dalam folder pengguna di Google Cloud Storage
    const folderName = `users/${id}/profile-pictures/`;
    const [files] = await bucket.getFiles({ prefix: folderName });

    if (files.length > 0) {
      for (const file of files) {
        await file.delete().catch((err) => {
          console.error('Error deleting file:', err);
        });
      }
    }

    // Hapus user dari database
    await user.destroy();

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting account' });
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  changePassword,
  updateProfile,
  uploadProfilePicture,
  upgradeToBusiness,
  deleteAccount
};