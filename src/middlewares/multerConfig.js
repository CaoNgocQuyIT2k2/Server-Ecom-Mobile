const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinaryConfig"); // Import Cloudinary config

// Cấu hình lưu trữ trên Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "user_avatars", // Thư mục trên Cloudinary
    allowed_formats: ["jpg", "png", "jpeg"], // Định dạng ảnh cho phép
    transformation: [{ width: 300, height: 300, crop: "limit" }], // Giới hạn kích thước
  },
});

// Middleware Multer để upload file
const upload = multer({ storage });

module.exports = upload;
