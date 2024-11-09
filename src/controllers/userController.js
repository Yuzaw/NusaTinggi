const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const users = require('../data/users');

// Register
exports.register = async (req, res) => {
  const { username, password } = req.body;

  const userExists = users.some((user) => user.username === username);

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  users.push({ username, password: hashedPassword });
  res.status(201).json({ message: 'User registered successfully' });
};

// Login
exports.login = (req, res) => {
  const { username, password } = req.body;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  bcrypt.compare(password, user.password, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error comparing passwords' });
    }
    if (!result) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = jwt.sign({ username: user.username }, 'supersecretkey', { expiresIn: '1h' });
    res.status(200).json({ accessToken });
  });
};

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token not found' });

  jwt.verify(token, 'supersecretkey', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};
