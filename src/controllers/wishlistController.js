const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

exports.toggleWishlist = async (req, res) => {
    try {
        const { idUser, productId } = req.body;

        // Kiểm tra sản phẩm có tồn tại không
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại!" });

        // Kiểm tra xem sản phẩm đã có trong wishlist chưa
        const existingWishlist = await Wishlist.findOne({ idUser, productId });

        if (existingWishlist) {
            // Nếu đã có, xóa khỏi wishlist
            await Wishlist.deleteOne({ idUser, productId });
            return res.status(200).json({ success: true, message: "Đã xóa khỏi danh sách yêu thích!" });
        }

        // Nếu chưa có, thêm vào wishlist
        const newWishlist = new Wishlist({ idUser, productId });
        await newWishlist.save();

        res.status(201).json({ success: true, message: "Đã thêm vào danh sách yêu thích!", wishlist: newWishlist });
    } catch (error) {
        console.error("❌ Lỗi khi cập nhật wishlist:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};


exports.getWishlist = async (req, res) => {
    try {
        const { idUser } = req.params;

        // Lấy danh sách wishlist của user và populate để lấy thông tin sản phẩm
        const wishlist = await Wishlist.find({ idUser }).populate("productId");

        res.status(200).json({ success: true, wishlist });
    } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách yêu thích:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};


exports.removeFromWishlist = async (req, res) => {
    try {
        const { idUser, productId } = req.body;

        if (!idUser || !productId) {
            return res.status(400).json({ success: false, message: "Thiếu thông tin yêu cầu!" });
        }

        const result = await Wishlist.findOneAndDelete({ idUser, productId });

        if (!result) {
            return res.status(404).json({ success: false, message: "Sản phẩm không có trong danh sách yêu thích!" });
        }

        res.status(200).json({ success: true, message: "Đã xóa sản phẩm khỏi danh sách yêu thích!" });
    } catch (error) {
        console.error("❌ Lỗi khi xóa sản phẩm khỏi Wishlist:", error);
        res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
};