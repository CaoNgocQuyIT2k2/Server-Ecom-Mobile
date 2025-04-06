const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        idUser: { type: Number, ref: "User", required: true },
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true }, // 🔥 Thêm orderId vào Review
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
