const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/users');
const { Sequelize } = require('sequelize');
const upload = require('../middleware/upload');
const bucket = require('../config/cloudStorage');

const SECRET_KEY = process.env.SECRET_KEY;

// Register
exports.register = async (req, res) => {
  const { username, email, password, gender, dateOfBirth } = req.body;

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
exports.login = async (req, res) => {
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
      { expiresIn: '10m' }
    );

    res.cookie('token', accessToken, { httpOnly: true, secure: true });
    res.status(200).json({ message: 'Login successful, token set in cookie' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error logging in' });
  }
};

// Get Profile by ID
exports.getProfile = async (req, res) => {
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
exports.changePassword = async (req, res) => {
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
exports.updateProfile = async (req, res) => {
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
exports.uploadProfilePicture = [
  upload.single('profilePicture'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { id } = req.user; // Ambil ID dari token

      // Ambil data user dari database
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Jika pengguna sudah memiliki gambar profil sebelumnya, hapus gambar lama
      if (user.profilePicture) {
        const oldFilePath = user.profilePicture.replace(`https://storage.googleapis.com/${bucket.name}/`, '');
        await bucket.file(oldFilePath).delete().catch((err) => {
          console.error('Error deleting old profile picture:', err);
        });
      }

      // Nama folder berdasarkan username
      const folderName = `users/${user.username}/profile-pictures/`;

      // Nama file unik untuk menghindari duplikasi
      const fileName = `${Date.now()}-${req.file.originalname}`;

      // Gabungkan folder dan nama file untuk path
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

// Delete Account
exports.deleteAccount = async (req, res) => {
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