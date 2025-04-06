const express = require("express");
const { saveViewedProduct, getRecentlyViewed } = require("../controllers/viewedProductController");
const { verifyToken } = require("../middlewares/authMiddleware");
const router = express.Router();

// 📌 API: Lưu sản phẩm đã xem
router.post("/saveViewedProduct", verifyToken, saveViewedProduct);

// 📌 API: Lấy danh sách sản phẩm đã xem gần đây của người dùng
router.get("/getRecentlyViewed/:idUser", verifyToken, getRecentlyViewed);

module.exports = router;
