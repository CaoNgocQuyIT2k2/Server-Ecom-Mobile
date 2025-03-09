const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");
const { editProfile, getProfile, uploadAvatar, editPassword, forgotPassword, verifyPassOTP, resetPassword, editFullName, requestChangeEmail, verifyChangeEmail, requestChangePhoneNumber, verifyChangePhoneNumber } = require("../controllers/userController");
const upload = require("../middlewares/multerConfig");

router.get("/getProfile", getProfile);
// router.put("/updateProfile", editProfile);
router.post("/uploadAvatar", upload.single("avatar"), uploadAvatar);
router.put("/updatePassword", editPassword);
router.post("/forgotPassword", forgotPassword); // Gửi OTP
router.post("/verifyPassOtp", verifyPassOTP); // Xác thực OTP
router.post("/resetPassword", resetPassword); // Đặt lại mật khẩu
router.put("/updateFullName", editFullName);
// Gửi OTP đến email mới
router.post("/requestChangeEmail", requestChangeEmail);
// Xác thực OTP và cập nhật email mới
router.post("/verifyChangeEmail", verifyChangeEmail);
// Gửi OTP đến Phone mới
router.post("/requestChangePhone", requestChangePhoneNumber);
// Xác thực OTP và cập nhật Phone mới
router.post("/verifyChangePhone", verifyChangePhoneNumber);

module.exports = router;
