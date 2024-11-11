const bcrypt = require('bcryptjs');

const users = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: bcrypt.hashSync('12345', 10),
    gender: 'Male',
    age: 30
  }
];
module.exports = users;