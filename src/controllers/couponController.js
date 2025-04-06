const Coupon = require("../models/Coupon");

exports.createOrder = async (req, res) => {
    try {
        const { idUser, products, totalAmount } = req.body;

        // Tạo đơn hàng
        const newOrder = new Order({
            idUser,
            products,
            totalAmount,
            paymentMethod: req.body.paymentMethod,
            status: "New Order"
        });
        await newOrder.save();

        // Xác định mức giảm giá dựa vào tổng tiền đơn hàng
        let discount = 0;
        if (totalAmount >= 100) discount = 10;
        else if (totalAmount >= 30) discount = 8;
        else discount = 6;

        // Tạo mã giảm giá
        const couponCode = `SALE${discount}-${Date.now()}`;
        const newCoupon = new Coupon({
            code: couponCode,
            discount,
            idUser,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 ngày sau
        });
        await newCoupon.save();

        res.status(201).json({ success: true, message: "Đơn hàng đã tạo!", order: newOrder, coupon: newCoupon });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
};


exports.getUserCoupons = async (req, res) => {
    try {
        const { idUser } = req.params;
        const coupons = await Coupon.find({ idUser, isUsed: false, expiresAt: { $gte: new Date() } });

        res.status(200).json({ success: true, coupons });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
};


exports.applyCoupon = async (req, res) => {
    try {
        const { idUser, code, totalAmount } = req.body;

        const coupon = await Coupon.findOne({ idUser, code, isUsed: false, expiresAt: { $gte: new Date() } });
        if (!coupon) return res.status(400).json({ success: false, message: "Mã giảm giá không hợp lệ hoặc đã hết hạn!" });

        const discountAmount = (totalAmount * coupon.discount) / 100;
        const finalAmount = totalAmount - discountAmount;

        res.status(200).json({ success: true, discount: coupon.discount, finalAmount });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
};
