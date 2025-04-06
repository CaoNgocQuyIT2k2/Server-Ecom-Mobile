const express = require("express");
const { verifyToken } = require("../middlewares/authMiddleware");
const { getUserCoupons, applyCoupon, createOrder } = require("../controllers/couponController");
const router = express.Router();

// 📌 Tạo đơn hàng (Tự động cấp mã giảm giá)
router.post("/createOrder", verifyToken, createOrder);

// 📌 Lấy danh sách mã giảm giá của người dùng
router.get("/:idUser", verifyToken, getUserCoupons);

// 📌 Áp dụng mã giảm giá
router.post("/applyCoupon", verifyToken, applyCoupon);

module.exports = router;
