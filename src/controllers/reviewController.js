const Review = require("../models/Review");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const mongoose = require("mongoose");


exports.createReview = async (req, res) => {
    try {
        const { idUser, orderId, reviews } = req.body;

        console.log("📌 Debug: req.body =>", req.body);

        const orderObjectId = new mongoose.Types.ObjectId(orderId);

        const order = await Order.findOne({ _id: orderObjectId, idUser, status: "Delivered" });
        if (!order) {
            return res.status(400).json({ success: false, message: "Đơn hàng không hợp lệ hoặc chưa được giao!" });
        }

        console.log("📌 Debug Order:", order);

        const existingReviews = await Review.find({ idUser, orderId: orderObjectId });
        if (existingReviews.length > 0) {
            return res.status(400).json({ success: false, message: "Bạn đã đánh giá đơn hàng này rồi!" });
        }

        if (!Array.isArray(reviews) || reviews.length === 0) {
            return res.status(400).json({ success: false, message: "Danh sách đánh giá không hợp lệ!" });
        }

        let newReviews = [];
        for (const { productId, rating, comment } of reviews) {
            const newReview = new Review({
                idUser,
                productId,
                rating,
                comment,
                orderId: orderObjectId
            });

            await newReview.save();
            newReviews.push(newReview);

            // Cập nhật rating sản phẩm
            const product = await Product.findById(productId);
            if (product) {
                // Cập nhật tổng số đánh giá và sao
                product.ratings.totalRatings += 1;
                product.ratings.stars[rating] += 1;
            
                // Tính tổng điểm sao
                let totalStars = 0;
                for (let i = 1; i <= 5; i++) {
                    totalStars += product.ratings.stars[i] * i;
                }
            
                // Tính điểm trung bình và làm tròn tới 1 chữ số thập phân
                product.ratings.average = Math.round((totalStars / product.ratings.totalRatings) * 10) / 10;
            
                // Lưu sản phẩm với giá trị đã được cập nhật
                await product.save();
            }
        }

        // Cộng điểm thưởng
        await User.findOneAndUpdate({ idUser }, { $inc: { rewardPoints: 0.02 } });

        res.status(201).json({
            success: true,
            message: "Đánh giá thành công! Bạn nhận được 0.02 điểm tích lũy.",
            reviews: newReviews
        });
    } catch (error) {
        console.error("❌ Lỗi khi đánh giá sản phẩm:", error.message);
        res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
};


// 📌 API: Lấy danh sách đánh giá của sản phẩm
exports.getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await Review.find({ productId });

        // Lấy danh sách user dưới dạng object để truy vấn nhanh hơn
        const userIds = reviews.map(r => Number(r.idUser));  
        const users = await User.find({ idUser: { $in: userIds } })
            .select("idUser fullName avatar")
            .lean(); // Lean giúp tối ưu hiệu suất

        // Chuyển danh sách user thành object để tra cứu nhanh
        const userMap = users.reduce((acc, user) => {
            acc[user.idUser] = user;
            return acc;
        }, {});

        // Gán thông tin user vào review
        const reviewsWithUser = reviews.map(review => ({
            ...review._doc,
            user: userMap[review.idUser] || null 
        }));

        res.status(200).json({ success: true, reviews: reviewsWithUser });
    } catch (error) {
        console.error("❌ Lỗi khi lấy đánh giá:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};

exports.get3LatestProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await Review.find({ productId })
            .sort({ createdAt: -1 })
            .limit(3);

        const userIds = reviews.map(r => Number(r.idUser));
        const users = await User.find({ idUser: { $in: userIds } })
            .select("idUser fullName avatar")
            .lean();

        const userMap = users.reduce((acc, user) => {
            acc[user.idUser] = user;
            return acc;
        }, {});

        const reviewsWithUser = reviews.map(review => ({
            ...review._doc,
            user: userMap[review.idUser] || null
        }));

        res.status(200).json({ success: true, reviews: reviewsWithUser });
    } catch (error) {
        console.error("❌ Lỗi khi lấy đánh giá mới nhất:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};


// 📌 API:  Đếm tổng số lượt đánh giá
exports.getTotalReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        
        // Đếm tổng số đánh giá (bao gồm cả đánh giá lặp)
        const totalReviews = await Review.countDocuments({ productId });

        res.status(200).json({ success: true, totalReviews });
    } catch (error) {
        console.error("❌ Lỗi khi lấy tổng số đánh giá:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};



exports.checkReviewStatus = async (req, res) => {
    try {
        const { orderId, idUser } = req.params;
        
        const review = await Review.findOne({ orderId, idUser });

        if (review) {
            return res.status(200).json({ success: true, reviewExists: true });
        } else {
            return res.status(200).json({ success: true, reviewExists: false });
        }
    } catch (error) {
        console.error("❌ Error checking review existence:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
