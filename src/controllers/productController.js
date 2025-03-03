const Product = require("../models/Product");
const SaleProduct = require("../models/SaleProduct");
const Category = require("../models/Category");

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