const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      console.log("🚫 Không có token!");
      return res.status(401).json({ message: "Không có token, truy cập bị từ chối" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");

    req.user = decoded; // Thêm user vào request
    next();
  } catch (error) {
    console.log("❌ Lỗi xác thực token:", error.message);
    res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};

