const express = require("express");

const { verifyToken } = require("../middlewares/authMiddleware");
const { requestCancelOrder, handleCancelRequest, getCancelRequests } = require("../controllers/requestCancelOrderController");
const router = express.Router();



// 📌 API: Gửi yêu cầu hủy đơn khi đã quá 30 phút hoặc trạng thái "Preparing"
router.post("/requestCancel/:idOrder", verifyToken, requestCancelOrder);

// 📌 API: Shop phê duyệt hoặc từ chối yêu cầu hủy  
router.put("/cancelRequest/:idRequest", verifyToken, handleCancelRequest);


// 📌 API: Lấy danh sách đơn hàng có yêu cầu hủy  
// router.get("/cancelRequests", verifyToken, getCancelRequests);
router.get("/cancelRequests", verifyToken,  getCancelRequests); // ❌ Xóa verifyToken


module.exports = router;
