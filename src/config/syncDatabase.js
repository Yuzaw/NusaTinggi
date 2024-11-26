const User = require('../models/users');
const Product = require('../models/products');
const MyTrip = require('../models/myTrip');
const MyBusiness = require('../models/myBusiness');

const syncDatabase = async () => {
  try {
    await User.sync({ force: false });
    console.log('User table synced');

    await Product.sync({ force: false });
    console.log('Product table synced');

    await MyTrip.sync({ force: false });
    console.log('MyTrip table synced');

    await MyBusiness.sync({ force: false });
    console.log('MyBusiness table synced');
  } catch (err) {
    console.error('Error syncing database:', err);
    throw err;
  }
};

module.exports = syncDatabase;