const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    id: Number,
    title: String,
    price: Number,
    description: String,
    images: [String],
    category: {
      id: Number,
      name: String,
      image: String
    }
}); 

module.exports = mongoose.model('SaleProduct', ProductSchema);
                                                      