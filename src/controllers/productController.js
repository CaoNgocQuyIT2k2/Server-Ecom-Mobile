const Product = require("../models/Product");
const SaleProduct = require("../models/SaleProduct");
const Category = require("../models/Category");
const Order = require('../models/Order'); // Đảm bảo import đúng mô hình Order
const mongoose = require("mongoose");


// Lấy danh sách tất cả sản phẩm
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi lấy danh sách sản phẩm" });
    }
};

// Lấy danh sách sản phẩm giảm giá từ saleProducts
exports.getSaleProducts = async (req, res) => {
    try {
        const saleProducts = await SaleProduct.find();
        console.log("Sale Products từ DB:", saleProducts);
        res.json(saleProducts); // Trả về danh sách mà không có key "saleProducts"
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi lấy danh sách sản phẩm giảm giá" });
    }
};


// Lấy danh sách danh mục
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi lấy danh mục" });
    }
};


// API lấy 10 sản phẩm bán chạy nhất
exports.getTop10Sold = async (req, res) => {
    try {
      const topSoldProducts = await Product.find()
        .sort({ soldCount: -1 }) // Sắp xếp giảm dần theo soldCount
        .limit(10); // Giới hạn 10 sản phẩm
  
      res.status(200).json(topSoldProducts);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy sản phẩm bán chạy nhất', error });
    }
  };

// API tìm kiếm sản phẩm theo title hoặc category
exports.searchProducts = async (req, res) => {
    try {
        const { key } = req.query;
        if (!key) {
            return res.status(400).json({ message: "Vui lòng nhập từ khóa tìm kiếm" });
        }
        // Tìm kiếm trong title, category, description, và brand
        const products = await Product.find({
            $or: [
                { title: { $regex: key, $options: "i" } },
                { "category.name": { $regex: key, $options: "i" } },
                { description: { $regex: key, $options: "i" } },
            ]
        });

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi tìm kiếm sản phẩm", error });
    }
};

//  API lấy số sao trung bình của một sản phẩm
exports.getProductRating = async (req, res) => {
    try {
        const { id } = req.params;

        // Tìm sản phẩm theo id
        const product = await Product.findOne({ id: parseInt(id) }).lean();

        if (!product) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại" });
        }

        // Trả về số sao trung bình đã lưu trong DB
        res.status(200).json({ 
            productId: product.id,
            title: product.title,
            averageRating: product.ratings?.average || 0,  // ✅ Lấy trực tiếp từ DB
            totalRatings: product.ratings?.totalRatings || 0
        });

    } catch (error) {
        console.error("🔥 Error fetching rating:", error);
        res.status(500).json({ message: "Lỗi khi lấy đánh giá sản phẩm", error });
    }
};


// API lấy thông tin sản phẩm theo ID
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Tìm sản phẩm theo id
        const product = await Product.findOne({ id });

        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy sản phẩm", error });
    }
};

// API lấy thông tin sản phẩm tương tự
exports.getSimilarProducts = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm!" });
        }

        const similarProducts = await Product.find({
            "category.id": product.category.id,
            _id: { $ne: productId } // Loại trừ sản phẩm hiện tại
        }).limit(10);

        res.status(200).json({ success: true, similarProducts });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
};


//Lấy số lượng đơn hàng có chứa sản phẩm đó (đếm số khách mua)
exports.countUniqueBuyers = async (req, res) => {
    try {
      const { productId } = req.params;
   // Đảm bảo productId có giá trị hợp lệ
   console.log("Fetching unique buyers for productId:", productId);
      // Sử dụng aggregate để đếm số lượng người mua sản phẩm duy nhất
      const uniqueBuyers = await Order.aggregate([
        { $match: { "products.productId": productId } },  // Lọc theo sản phẩm
        { $group: { _id: "$idUser" } },  // Nhóm theo idUser để đếm người mua duy nhất
        { $count: "totalBuyers" }  // Đếm tổng số người mua duy nhất
      ]);
  
      res.status(200).json({
        success: true,
        totalBuyers: uniqueBuyers.length > 0 ? uniqueBuyers[0].totalBuyers : 0
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
  };
  

// API lấy sản phẩm theo _id (MongoDB ObjectId)
exports.getProductByMongoId = async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra xem id có phải là ObjectId hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Product ID không hợp lệ" });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error("🔥 Lỗi khi lấy sản phẩm:", error);
        res.status(500).json({ message: "Lỗi khi lấy sản phẩm", error: error.message });
    }
};
