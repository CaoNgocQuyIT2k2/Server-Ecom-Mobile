const RecentlyViewed = require("../models/RecentlyViewed");
const Product = require("../models/Product");

exports.saveRecentlyViewed = async (req, res) => {
    try {
        const { productId, userId } = req.body;
        const existingView = await RecentlyViewed.findOne({ productId, IdUser: userId });
        if (existingView) {
          return res.status(200).json({ success: true, message: "Sản phẩm đã được lưu trước đó!" });
        }
        if (!userId || !productId) {
            return res.status(400).json({ success: false, message: "Thiếu userId hoặc productId!" });
        }
     
        // Lấy thông tin sản phẩm
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại!" });
        }

        const productData = new RecentlyViewed({
            IdUser: userId,
            productId,
            title: product.title,
            price: product.price,
            image: product.images[0], // Lấy ảnh đầu tiên
            viewedAt: new Date(), // Cập nhật thời gian xem
        });

        await productData.save(); // Lưu sản phẩm vào database

        res.status(200).json({ success: true, message: "Lưu sản phẩm đã xem thành công!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
};


exports.getRecentlyViewed = async (req, res) => {
  try {
    const { idUser } = req.params;

    if (!idUser) {
      return res.status(400).json({ success: false, message: "Thiếu idUser!" });
    }

    // Tìm tất cả sản phẩm đã xem của người dùng
    const recentlyViewedProducts = await RecentlyViewed.find({ IdUser: idUser })
      .populate('productId')  // Populate để lấy thông tin sản phẩm
      .sort({ viewedAt: -1 }); // Sắp xếp theo thời gian xem, sản phẩm xem gần đây nhất lên đầu

    if (!recentlyViewedProducts || recentlyViewedProducts.length === 0) {
      return res.status(404).json({ success: false, message: "Không có sản phẩm đã xem!" });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy sản phẩm đã xem thành công!",
      recentlyViewedProducts,
    });
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm đã xem:", error);
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};
