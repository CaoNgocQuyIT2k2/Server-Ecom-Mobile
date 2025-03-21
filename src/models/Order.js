const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        idUser: { type: String, required: true },
        address: {
            fullName: String,
            phone: String,
            addressLine: String,
            city: String,
            state: String,
            country: String,
        },
        products: [
            {
                productId: { type: String, required: true },
                title: String,
                quantity: Number,
                price: Number,
                image: String,
            }
        ],
        paymentMethod: { type: String, required: true },
        totalAmount: { type: Number, required: true },
        status: { type: String, default: "New Order" },
        previousStatus: { type: String, default: null }, // ✅ Lưu trạng thái trước khi yêu cầu hủy
        autoConfirmAt: { type: Date, index: true, default: null },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
