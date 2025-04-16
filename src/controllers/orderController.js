const Order = require("../models/Order");
const User = require("../models/User");
const Address = require("../models/Address");
const moment = require("moment"); // Import moment library for time handling
const mongoose = require("mongoose");
const UserCoupons = require("../models/UserCoupons");  // Import UserCoupons model

// 📌 API: Create Order
const Coupon = require("../models/Coupon"); // Import model Coupon
const Product = require("../models/Product");
const { getTimeRange } = require("../utils/time");
const { groupByTimeUnit } = require("../utils/groupBy");
const { pushNotificationToUser } = require('../../socket'); // hoặc '../socket' tùy vị trí thật sự
const Notification = require("../models/Notification");


// 📌 API: Create Order + Generate Discount Codeconst Order = require("../models/Order");
exports.createOrder = async (req, res) => {
    try {
        const {
            idUser,
            address,
            products,
            paymentMethod,
            totalAmount,
            discountAmount = 0,
            usedRewardPoints = 0,
            coupon: couponCode,
        } = req.body;

        // Validate coupon
        let coupon = null;
        if (couponCode) {
            coupon = await Coupon.findOne({ code: couponCode });
            if (!coupon || coupon.isUsed || coupon.expirationDate < new Date()) {
                return res.status(400).json({ message: 'Coupon invalid or expired.' });
            }
        }

        // Weekly discount generation
        const currentWeekStart = moment().startOf('week').toDate();
        const currentWeekEnd = moment().endOf('week').toDate();
        let userCoupons = await UserCoupons.findOne({ idUser });

        if (!userCoupons) {
            userCoupons = new UserCoupons({ idUser, coupons: [] });
        }

        const weeklyCoupons = userCoupons.coupons.filter(coupon =>
            moment(coupon.dateReceived).isBetween(currentWeekStart, currentWeekEnd, null, '[]')
        );

        const receivedDiscounts = weeklyCoupons.map(c => {
            const match = c.code.match(/DISCOUNT(\d+)-/);
            return match ? parseInt(match[1]) : null;
        }).filter(v => v !== null);

        let discountOptions = [];
        if (totalAmount > 100) discountOptions = [10, 8, 6];
        else if (totalAmount > 30) discountOptions = [8, 6];
        else if (totalAmount > 0) discountOptions = [6];

        let discountCode = null;
        let discountPercent = null;
        for (const discount of discountOptions) {
            if (!receivedDiscounts.includes(discount)) {
                discountPercent = discount;
                discountCode = `DISCOUNT${discount}-${Date.now()}`;
                break;
            }
        }

        // Validate order data
        if (!idUser || !address || !products.length || !paymentMethod || !totalAmount) {
            return res.status(400).json({ success: false, message: "Invalid data" });
        }

        // Create new order
        const newOrder = new Order({
            idUser,
            address,
            products,
            paymentMethod,
            totalAmount,
            discountAmount,
            usedRewardPoints,
            coupon: couponCode || null,
            status: "New Order",
            autoConfirmAt: moment().add(30, "minutes").toDate(),
        });

        await newOrder.save();

        // Trừ rewardPoints của user nếu có sử dụng
        if (usedRewardPoints > 0) {
            const user = await User.findOne({ idUser });

            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            const currentPoints = parseFloat(user.rewardPoints.toString());
            if (usedRewardPoints > currentPoints) {
                return res.status(400).json({ success: false, message: "Not enough reward points" });
            }

            user.rewardPoints = (currentPoints - usedRewardPoints).toFixed(2); // Giữ 2 chữ số thập phân
            await user.save();
        }


        // Save new discount coupon for user
        if (discountCode && discountPercent) {
            const newCoupon = new Coupon({
                idUser,
                code: discountCode,
                discount: discountPercent,
                expiresAt: moment().add(7, "days").toDate(),
                isUsed: false,
            });

            await newCoupon.save();
            userCoupons.coupons.push({ code: discountCode, dateReceived: new Date() });
            await userCoupons.save();
        }

        // Mark used coupon as used
        if (coupon) {
            coupon.isUsed = true;
            await coupon.save();
        }

        // Build discount message
        let discountMessage = undefined;
        if (discountPercent) {
            discountMessage = `You have received a discount code of ${discountPercent}% for your next order!`;
        } else if (
            discountOptions.length > 0 &&
            discountOptions.every(d => receivedDiscounts.includes(d))
        ) {
            discountMessage = "You've already received all discount levels this week!";
        }

        // Final response
        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order: newOrder,
            discountCode,
            discountMessage
        });

    } catch (error) {
        console.error("❌ Error placing order:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
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
        console.log("🔍 orderId nhận được:", orderId);
        console.log("🧪 Hợp lệ ObjectId:", mongoose.Types.ObjectId.isValid(orderId));

        // 🔹 Kiểm tra ID có hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: "ID đơn hàng không hợp lệ",
            });
        }

        // 🔹 Tìm đơn hàng và populate thông tin sản phẩm
        const order = await Order.findById(orderId).populate("products.productId", "title price");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đơn hàng",
            });
        }

        res.status(200).json({
            success: true,
            message: "Lấy thông tin đơn hàng thành công",
            data: order,
        });

    } catch (error) {
        console.error("❌ Lỗi khi lấy chi tiết đơn hàng:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ khi lấy chi tiết đơn hàng",
            error: error.message,
        });
    }
};

// 📌 API: Update Order Status
// API: Update Order Status to Delivered
exports.updateOrderStatus = async (req, res) => {
    try {
      let { orderId } = req.params;
      const { status } = req.body;
  
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ success: false, message: "Invalid order ID" });
      }
  
      const validStatuses = ["Confirmed", "Preparing", "Shipping", "Delivered", "Cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status" });
      }
  
      const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }
  
      console.log("Order status updated to:", status);
  
      // Nếu đã giao hàng, cập nhật số lượng đã bán
      if (status === "Delivered") {
        for (const product of order.products) {
          const productId = product.productId;
          const quantitySold = product.quantity;
  
          await Product.findOneAndUpdate(
            { _id: productId },
            { $inc: { soldCount: quantitySold } },
            { new: true }
          );
        }
      }
  
      // Map status sang statusText
      const statusTextMap = {
        Confirmed: "Your order has been confirmed",
        Preparing: "Your order is being prepared",
        Shipping: "Your order has been shipped",
        Delivered: "Your order has been completed",
        Cancelled: "Your order has been cancelled",
      };
  
      const statusText = statusTextMap[status];
  
      // Tạo thông báo
      const notification = {
        idUser: order.idUser,
        type: 'order',
        title: `Order ${orderId}`,
        content: "",
        image: order.products.length > 0 ? order.products[0].image : null,
        orderId: order._id.toString(),
        status: order.status,
        statusText, // Thêm dòng này vào
        isRead: false,
        _id: new mongoose.Types.ObjectId().toString(),
        createdAt: new Date(),
      };
  
      // Thiết lập nội dung của thông báo dựa trên trạng thái đơn hàng
      switch (status) {
        case "Confirmed":
          notification.content = `Your order with code ${order._id} has been confirmed. Thank you for placing your order.`;
          break;
        case "Preparing":
          notification.content = `Your order with code ${order._id} is being prepared for shipping soon.`;
          break;
        case "Shipping":
          notification.content = `Your order with code ${order._id} has been shipped to your delivery point.`;
          break;
        case "Delivered":
          notification.content = `Your order with code ${order._id} has been completed. Please rate the products to earn 0.02 reward points and help other customers understand the product better!`;
          break;
        case "Cancelled":
          notification.content = `Your order with code ${order._id} has been canceled by the system. We apologize for any inconvenience caused.`;
          break;
      }
  
      // Lưu thông báo vào MongoDB
      const createdNotification = await Notification.create(notification); // Sử dụng await để đợi lưu thông báo
  
      // Gửi thông báo qua socket
      pushNotificationToUser(order.idUser.toString(), createdNotification);
  
      res.status(200).json({
        success: true,
        message: "Order status updated successfully",
        data: order,
      });
  
    } catch (error) {
      console.error("❌ Error updating order status:", error);
      res.status(500).json({
        success: false,
        message: "Error updating order status",
        error: error.message,
      });
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


// 📌 API: Get Order Stats for a User
exports.getUserOrderStats = async (req, res) => {
    try {
        const { userId } = req.params;

        const orders = await Order.find({ idUser: userId });

        if (!orders.length) {
            return res.status(200).json({
                success: true,
                message: "User has no orders.",
                stats: {
                    totalOrders: 0,
                    statusBreakdown: {},
                    totalRevenue: 0
                }
            });
        }

        const stats = {
            totalOrders: orders.length,
            totalRevenue: 0,
            statusBreakdown: {}, // e.g. { "Delivered": 3, "New Order": 2, ... }
            totalByStatus: {}    // e.g. { "Delivered": 150, "Cancelled": 80, ... }
        };

        orders.forEach(order => {
            const status = order.status;

            // Đếm số đơn theo từng trạng thái
            if (!stats.statusBreakdown[status]) {
                stats.statusBreakdown[status] = 0;
                stats.totalByStatus[status] = 0;
            }
            stats.statusBreakdown[status]++;
            stats.totalByStatus[status] += order.totalAmount;

            // Cộng vào tổng doanh thu nếu đơn hàng chưa bị hủy
            if (status !== "Cancelled") {
                stats.totalRevenue += order.totalAmount;
            }
        });

        res.status(200).json({
            success: true,
            message: "Successfully fetched order statistics",
            stats
        });
    } catch (error) {
        console.error("❌ Error fetching order statistics:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};



exports.getUserOrderSummary = async (req, res) => {
  try {
    const { userId } = req.params;
    const { range = 'all', groupBy } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'Missing userId' });
    }

    const filter = { idUser: parseInt(userId) };
    const timeRange = getTimeRange(range);
    if (timeRange.$gte && timeRange.$lte) {
      filter.createdAt = timeRange;
    }

    const orders = await Order.find(filter);

    const stats = {};
    let totalAmount = 0, totalDiscount = 0, totalRewardUsed = 0;

    orders.forEach(order => {
      const status = order.status;
      stats[status] = stats[status] || {
        totalOrders: 0, totalAmount: 0, totalDiscount: 0, totalRewardUsed: 0
      };
      stats[status].totalOrders += 1;
      stats[status].totalAmount += order.totalAmount;
      stats[status].totalDiscount += order.discountAmount || 0;
      stats[status].totalRewardUsed += order.usedRewardPoints || 0;

      totalAmount += order.totalAmount;
      totalDiscount += order.discountAmount || 0;
      totalRewardUsed += order.usedRewardPoints || 0;
    });

    const cancelRate = ((stats['Cancelled']?.totalOrders || 0) / orders.length) * 100;
    const successRate = ((stats['Delivered']?.totalOrders || 0) / orders.length) * 100;

    // Nhóm theo tuần / tháng / năm
    let groupedByTime = {};
    if (groupBy) {
      groupedByTime = groupByTimeUnit(orders, groupBy);
    }

    res.status(200).json({
      success: true,
      message: `Order summary (${range})`,
      range,
      groupBy: groupBy || null,
      statisticsByStatus: stats,
      grouped: groupedByTime,
      totalOrders: orders.length,
      totalAmount,
      totalDiscount,
      totalRewardUsed,
      cancelRate: cancelRate.toFixed(2),
      successRate: successRate.toFixed(2),
    });
  } catch (error) {
    console.error("Order Summary Error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

