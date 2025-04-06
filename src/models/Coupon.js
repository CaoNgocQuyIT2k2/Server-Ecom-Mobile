const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true }, // Mã giảm giá
    discount: { type: Number, required: true }, // Phần trăm giảm giá (6%, 8%, 10%)
    idUser: { type: Number, required: true }, // Mã người dùng
    isUsed: { type: Boolean, default: false }, // Trạng thái sử dụng
    expiresAt: { type: Date, required: true }, // Hạn sử dụng
}, { timestamps: true });

module.exports = mongoose.model("Coupon", couponSchema);
