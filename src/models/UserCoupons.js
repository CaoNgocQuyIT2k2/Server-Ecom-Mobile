const mongoose = require("mongoose");

const userCouponsSchema = new mongoose.Schema({
    idUser: { type: Number, required: true },
    coupons: [
        {
            code: { type: String, required: true },
            dateReceived: { type: Date, required: true }, // Ngày nhận coupon
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model("UserCoupons", userCouponsSchema);
