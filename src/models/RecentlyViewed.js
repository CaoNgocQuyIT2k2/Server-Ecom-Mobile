const mongoose = require("mongoose");

const RecentlyViewedSchema = new mongoose.Schema({
    IdUser: { type: Number, ref: "User", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    title: String,
    price: Number,
    image: String,
    viewedAt: { type: Date, default: Date.now, expires: "1d" }, // Xóa sau 1 ngày
});

const RecentlyViewed = mongoose.model("RecentlyViewed", RecentlyViewedSchema);
module.exports = RecentlyViewed;
