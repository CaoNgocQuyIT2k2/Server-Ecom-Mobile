const CancelRequest = require("../models/CancelRequest");
const Order = require("../models/Order");
const moment = require("moment");

// Gửi yêu cầu hủy đơn hàng
exports.requestCancelOrder = async (req, res) => {
    try {
        const { idOrder } = req.params;
        const { reason } = req.body;
        const userId = req.user.idUser;
        console.log("Received request body:", req.body);

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const order = await Order.findById(idOrder);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        const now = new Date();
        const orderTime = new Date(order.createdAt);


        if (order.status === "Cancelled") {
            return res.status(400).json({ success: false, message: "Order is already canceled" });
        }

        if (order.status !== "Preparing" && order.status !== "Confirmed") {
            return res.status(400).json({ success: false, message: "Order cannot be canceled at this time" });
        }

        const existingCancelRequest = await CancelRequest.findOne({ orderId: idOrder });
        if (existingCancelRequest) {
            return res.status(400).json({ success: false, message: "Cancel request has already been processed" });
        }

        const cancelRequest = new CancelRequest({
            orderId: idOrder,
            userId,
            reason,
            status: "Pending",
            requestedAt: now
        });

        await cancelRequest.save();

        // ✅ Lưu trạng thái cũ và cập nhật trạng thái mới
        await Order.findByIdAndUpdate(idOrder, { 
            previousStatus: order.status, // Lưu trạng thái hiện tại
            status: "Pending" // Cập nhật trạng thái mới
        });

        res.status(200).json({ success: true, message: "Cancel request sent successfully", data: cancelRequest });
    } catch (error) {
        console.error("❌ Error requesting order cancellation:", error);
        res.status(500).json({ success: false, message: "Error requesting order cancellation", error: error.message });
    }
};



// Xử lý yêu cầu hủy đơn hàng (Duyệt hoặc Từ chối)
exports.handleCancelRequest = async (req, res) => {
    try {
        const { idRequest } = req.params;
        const { decision } = req.body; // "approved" hoặc "rejected"

        const cancelRequest = await CancelRequest.findById(idRequest).populate("orderId");
        if (!cancelRequest) {
            return res.status(404).json({ success: false, message: "Cancel request not found" });
        }

        if (cancelRequest.status !== "Pending") {
            return res.status(400).json({ success: false, message: "Cancel request has already been processed" });
        }

        const order = await Order.findById(cancelRequest.orderId._id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // ❌ Kiểm tra trạng thái đơn hàng trước khi xử lý yêu cầu hủy
        if (order.status !== "Pending") {
            return res.status(400).json({ success: false, message: "Order is not in a cancel request state" });
        }

        // ✅ Cập nhật trạng thái của yêu cầu hủy
        cancelRequest.status = decision === "approved" ? "Approved" : "Rejected";
        cancelRequest.processedAt = new Date();
        await cancelRequest.save();

        // ✅ Nếu duyệt hủy đơn, cập nhật trạng thái đơn hàng thành "Cancelled"
        if (decision === "approved") {
            order.status = "Cancelled";
            order.previousStatus = null; // Không cần lưu trạng thái cũ nữa
        } else {
            // ❌ Nếu từ chối, khôi phục trạng thái ban đầu
            order.status = order.previousStatus;
            order.previousStatus = null; // Xóa trạng thái cũ
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: decision === "approved" ? "Order canceled successfully" : "Cancel request rejected, order status restored",
            data: cancelRequest
        });
    } catch (error) {
        console.error("❌ Error processing cancel request:", error);
        res.status(500).json({ success: false, message: "Error processing cancel request", error: error.message });
    }
};

// Lấy danh sách yêu cầu hủy đơn hàng
exports.getCancelRequests = async (req, res) => {
    try {
        const cancelRequests = await CancelRequest.find().populate("orderId");
        res.status(200).json({ success: true, data: cancelRequests });
    } catch (error) {
        console.error("Error fetching cancel requests:", error);
        res.status(500).json({ success: false, message: "Error fetching cancel requests", error: error.message });
    }
};
