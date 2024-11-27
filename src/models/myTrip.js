// models/mytrip.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./users');
const Product = require('./products');

const MyTrip = sequelize.define('MyTrip', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  totalPrice: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'success', 'completed', 'cancelled'),
    defaultValue: 'pending',
    allowNull: false,
  },
  cancellationReason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
});

// Relasi antar model
User.hasMany(MyTrip, { foreignKey: 'userId' });
MyTrip.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(MyTrip, { foreignKey: 'productId' });
MyTrip.belongsTo(Product, { foreignKey: 'productId' });

module.exports = MyTrip;
