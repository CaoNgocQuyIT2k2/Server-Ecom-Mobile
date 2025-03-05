const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");
const { editProfile, getProfile, uploadAvatar, editPassword, forgotPassword, verifyPassOTP, resetPassword } = require("../controllers/userController");
const upload = require("../middlewares/multerConfig");

router.get("/getProfile", getProfile);
router.put("/updateProfile", editProfile);
router.post("/uploadAvatar", upload.single("avatar"), uploadAvatar);
router.put("/updatePassword", editPassword);
router.post("/forgotPassword", forgotPassword); // Gửi OTP
router.post("/verifyPassOtp", verifyPassOTP); // Xác thực OTP
router.post("/resetPassword", resetPassword); // Đặt lại mật khẩu

module.exports = router;
