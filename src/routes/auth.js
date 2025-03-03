const express = require("express");
const { registerUser, loginUser, verifyOTP } = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOTP); //  API xác thực OTP

module.exports = router;
