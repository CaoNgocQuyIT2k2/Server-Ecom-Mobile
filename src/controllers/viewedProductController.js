const ViewedProduct = require("../models/ViewedProduct");

exports.saveViewedProduct = async (req, res) => {
    try {
        const { idUser, productId } = req.body;

        if (!idUser || !productId) {
            return res.status(400).json({ success: false, message: "Thiếu idUser hoặc productId" });
        }

        await ViewedProduct.findOneAndUpdate(
            { idUser, productId }, 
            { viewedAt: new Date() }, 
            { upsert: true, new: true }
        );

        res.status(200).json({ success: true, message: "Đã lưu sản phẩm đã xem!" });
    } catch (error) {
        console.error("❌ Lỗi khi lưu sản phẩm đã xem:", error);
        res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
};



exports.getRecentlyViewed = async (req, res) => {
    try {
        const { idUser } = req.params;

        if (!idUser) {
            return res.status(400).json({ success: false, message: "Thiếu idUser" });
        }

        const viewedProducts = await ViewedProduct.find({ idUser })
            .sort({ viewedAt: -1 }) // Sắp xếp theo thời gian xem gần nhất
            .limit(10)
            .populate("productId", "title price images"); // Lấy thông tin sản phẩm

        res.status(200).json({ success: true, viewedProducts });
    } catch (error) {
        console.error("❌ Lỗi khi lấy sản phẩm đã xem:", error);
        res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
};