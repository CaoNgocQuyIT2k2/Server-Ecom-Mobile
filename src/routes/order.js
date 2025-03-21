const express = require("express");
const { createOrder, getUserOrders, getOrderDetails, updateOrderStatus, cancelOrder, getUserOrdersByStatus } = require("../controllers/orderController");
const { verifyToken } = require("../middlewares/authMiddleware");
const router = express.Router();

// 📌 API: Tạo đơn hàng
router.post("/create", verifyToken, createOrder);

// 📌 API: Lấy danh sách đơn hàng theo idUser   
router.get("/:idUser", verifyToken, getUserOrders);

// 📌 API: Lấy danh sách đơn hàng theo idUser và status  
router.get("/:idUser/status/:status", verifyToken, getUserOrdersByStatus);


router.get("/details/:idOrder", verifyToken, getOrderDetails);

router.put("/status/:orderId", verifyToken, updateOrderStatus);

router.put("/cancel/:idOrder", verifyToken, cancelOrder);




module.exports = router;
