const mongoose = require("mongoose");

const viewedProductSchema = new mongoose.Schema({
    idUser: { type: Number, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    viewedAt: { type: Date, default: Date.now }
});

// Tạo index để tăng tốc truy vấn
viewedProductSchema.index({ idUser: 1, viewedAt: -1 });

module.exports = mongoose.model("ViewedProduct", viewedProductSchema);
