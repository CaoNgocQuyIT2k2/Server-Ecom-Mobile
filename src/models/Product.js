const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  images: [String],
  category: {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true }
  },
  soldCount: { type: Number, default: 0 },
  ratings: {
    totalRatings: { type: Number, default: 0 }, // Tổng số lượt đánh giá
    stars: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 }
    },
    average: { type: Number, default: 0 } // ⭐ Lưu luôn vào DB
  }
});

module.exports = mongoose.model('Product', productSchema);
