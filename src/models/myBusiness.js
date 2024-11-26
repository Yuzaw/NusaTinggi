const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./users');
const Product = require('./products');

const MyBusiness = sequelize.define('MyBusiness', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
}, {
  timestamps: true,
});

// Relasi antar model
User.hasMany(MyBusiness, { foreignKey: 'userId' });
MyBusiness.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(MyBusiness, { foreignKey: 'productId' });
MyBusiness.belongsTo(Product, { foreignKey: 'productId' });

module.exports = MyBusiness;
