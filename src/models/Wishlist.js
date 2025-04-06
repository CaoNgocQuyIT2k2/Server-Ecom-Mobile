const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
    idUser: { type: Number, required: true, ref: "User" }, // Liên kết với User
    productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Product" },
    createdAt: { type: Date, default: Date.now } // Thời gian thêm vào wishlist
});

// Đảm bảo mỗi user không thể thêm 1 sản phẩm nhiều lần
wishlistSchema.index({ idUser: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model("Wishlist", wishlistSchema);
