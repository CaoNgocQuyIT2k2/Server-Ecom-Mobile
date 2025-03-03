const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: Number,
  title: String,
  price: Number,
  description: String,
  images: [String],
  category: {
    id: Number,
    name: String,
    image: String
  },
  soldCount: Number,
});

module.exports = mongoose.model('Product', productSchema);
