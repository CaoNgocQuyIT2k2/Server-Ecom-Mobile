const Order = require("../models/Order");
const User = require("../models/User");
const Address = require("../models/Address");
const moment = require("moment"); // Import moment library for time handling
const mongoose = require("mongoose");

// 📌 API: Create Order
exports.createOrder = async (req, res) => {
    try {
        const { idUser, address, products, paymentMethod, totalAmount } = req.body;

        if (!idUser || !address || !products.length || !paymentMethod || !totalAmount) {
            return res.status(400).json({ success: false, message: "Invalid data" });
        }

        const newOrder = new Order({
            idUser,
            address,
            products,
            paymentMethod,
            totalAmount,
            status: "New Order",
            autoConfirmAt: moment().add(30, "minutes").toDate(), // Auto-confirm after 30 minutes
        });

        await newOrder.save();
        res.status(201).json({ success: true, message: "Order placed successfully", order: newOrder });
    } catch (error) {
        console.error("❌ Error placing order:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// 📌 API: Get User Orders
exports.getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await Order.find({ userId }).sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        console.error("❌ Error fetching user orders:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// 📌 API: Get Order Details
exports.getOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId).populate("products.productId", "title price");
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        res.status(200).json({ success: true, data: order });
    } catch (error) {
        console.error("Error fetching order details:", error);
        res.status(500).json({ success: false, message: "Error fetching order details", error: error.message });
    }
};

// 📌 API: Update Order Status
exports.updateOrderStatus = async (req, res) => {
    try {
        let { orderId } = req.params;
        const { status } = req.body;
        console.log("Received orderId:", orderId);
        console.log("Is orderId valid?:", mongoose.Types.ObjectId.isValid(orderId));
        console.log("Requested status:", status);
        
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ success: false, message: "Invalid order ID" });
        }

        orderId = new mongoose.Types.ObjectId(orderId); // Ép kiểu về ObjectId

        const validStatuses = ["Confirmed", "Preparing", "Shipping", "Delivered", "Cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.status(200).json({ success: true, message: "Order status updated successfully", data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating order status", error: error.message });
    }
};

// 📌 API: Cancel Order
exports.cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (order.status !== "New Order" && order.status !== "Confirmed") {
            return res.status(400).json({ success: false, message: "Cannot cancel a processed order" });
        }

        const now = moment();
        const orderTime = moment(order.createdAt);
        if (now.diff(orderTime, "minutes") > 30) {
            return res.status(400).json({ success: false, message: "Order cannot be canceled after 30 minutes" });
        }

        order.status = "Cancelled";
        await order.save();

        res.status(200).json({ success: true, message: "Order has been successfully canceled", data: order });
    } catch (error) {
        console.error("Error cancelling order:", error);
        res.status(500).json({ success: false, message: "An error occurred while canceling the order", error: error.message });
    }
};

// 📌 API: Get User Orders by Status
exports.getUserOrdersByStatus = async (req, res) => {
    try {
        const { userId, status } = req.params;
        const decodedStatus = decodeURIComponent(status);

        console.log("📌 Received Status:", decodedStatus);

        const validStatuses = ["Pending", "New Order", "Confirmed", "Preparing", "Shipping", "Delivered", "Cancelled"];
        if (!validStatuses.includes(decodedStatus)) {
            return res.status(400).json({ success: false, message: "Invalid order status" });
        }

        console.log("Decoded Status:", decodedStatus);
        const orders = await Order.find({
            userId,
            $or: [
                { status: decodedStatus },
                { previousStatus: decodedStatus }
            ]
        })
        .sort({ createdAt: -1 })
        .select("userId status previousStatus products totalAmount createdAt");

        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error("❌ Error fetching orders by status:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};