const User = require("../models/User");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");


// API Đăng nhập user
exports.loginUser = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    const user = await User.findOne({ 
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }] 
    });

    if (!user) return res.status(400).json({ message: "Tài khoản không tồn tại" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Mật khẩu không đúng" });

    // Tạo JWT Token có thời hạn 30 ngày
    const token = jwt.sign(
      { idUser: user.idUser, email: user.email, username: user.username },
      process.env.JWT_SECRET || "your_secret_key",
      { expiresIn: "30d" } // ⬅️ Set thời gian hết hạn 30 ngày
    );

    res.status(200).json({
      idUser: user.idUser,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      avatar: user.avatar,
      isVerified: user.isVerified,
      token, // Gửi token về client
      message: "Đăng nhập thành công!",
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};



// Hàm tạo OTP ngẫu nhiên
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
// API Đăng ký userconst User = require("../models/User");
exports.registerUser = async (req, res) => {
  try {
    const { email, username, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Mật khẩu nhập lại không khớp" });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: "Username đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo OTP ngẫu nhiên
    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP hết hạn sau 10 phút

    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      otpCode,
      otpExpires,
    });

    await newUser.save();

    // Gửi OTP qua email
    await sendEmail(email, "Mã OTP xác thực tài khoản", `Mã OTP của bạn là: ${otpCode}`);

    res.status(201).json({
      message: "Đăng ký thành công! Vui lòng kiểm tra email để nhận OTP.",
      idUser: newUser.idUser,
      email: newUser.email,
      username: newUser.username,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};


exports.verifyOTP = async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Tài khoản đã xác thực trước đó" });
    }

    if (user.otpCode !== otpCode) {
      return res.status(400).json({ message: "Mã OTP không chính xác" });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: "Mã OTP đã hết hạn" });
    }

    // Cập nhật trạng thái xác thực
    user.isVerified = true;
    user.otpCode = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({ message: "Xác thực thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};
