const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("../utils/cloudinaryConfig");
const sendEmail = require("../utils/sendEmail");



// 📌 API lấy thông tin người dùng
exports.getProfile = async (req, res) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1]; // Lấy token từ headers
    if (!token) return res.status(401).json({ message: "Không có token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key"); // Giải mã token

    const user = await User.findOne({ idUser: decoded.idUser }).select("fullName email phone password avatar");
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
    console.log(user);
    res.status(200).json({
      message: "Lấy thông tin thành công",
      user: {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        password: user.password,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(401).json({ message: "Token không hợp lệ", error });
  }
};

// // 📌 API cập nhật thông tin người dùng
// exports.editProfile = async (req, res) => {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) return res.status(401).json({ message: "Không có token, không thể xác thực" });

//     let decoded;
//     try {
//       decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
//     } catch (error) {
//       return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
//     }

//     const user = await User.findOne({ idUser: decoded.idUser });
//     if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

//     const { fullName, phone, email, password } = req.body;

//     if (email && email !== user.email) {
//       const emailExists = await User.findOne({ email });
//       if (emailExists) return res.status(400).json({ message: "Email đã tồn tại" });
//       user.email = email;
//     }

//     if (fullName) user.fullName = fullName;
//     if (phone) user.phone = phone;

//     if (password) {
//       const hashedPassword = await bcrypt.hash(password, 10);
//       user.password = hashedPassword;
//     }

//     await user.save();
//     res.status(200).json({ message: "Cập nhật hồ sơ thành công!" });
//   } catch (error) {
//     res.status(500).json({ message: "Lỗi server", error });
//   }
// };

// // 📌 API cập nhật fullname người dùng
exports.editFullName= async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Không có token, không thể xác thực" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
    } catch (error) {
      return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    const user = await User.findOne({ idUser: decoded.idUser });
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

    const { fullName } = req.body;

    if (fullName) {
      user.fullName = fullName;
      await user.save();
      return res.status(200).json({ message: "Cập nhật họ tên thành công!" });
    }

    res.status(400).json({ message: "Không có dữ liệu để cập nhật" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};


// 🟢 API Upload avatar
exports.uploadAvatar = async (req, res) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1]; // Lấy token từ headers
    if (!token) return res.status(401).json({ message: "Không có token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key"); // Giải mã token

    const user = await User.findOne({ idUser: decoded.idUser });
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    if (!req.file) return res.status(400).json({ message: "Vui lòng chọn ảnh" });

    // Lưu URL của ảnh vào database
    user.avatar = req.file.path; // Cloudinary tự động lưu URL vào req.file.path
    await user.save();

    res.status(200).json({ message: "Cập nhật avatar thành công", avatar: user.avatar });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};


// 📌 API cập nhật ảnh đại diện
exports.updateAvatar = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Không có token, không thể xác thực" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
    } catch (error) {
      return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    const user = await User.findOne({ idUser: decoded.idUser });
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

    const { avatar } = req.body;
    if (!avatar) return res.status(400).json({ message: "Vui lòng cung cấp URL ảnh đại diện" });

    user.avatar = avatar;
    await user.save();

    res.status(200).json({
      message: "Cập nhật ảnh đại diện thành công!",
      avatar: user.avatar,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};


// 📌 API cập nhật mật khẩu
exports.editPassword = async (req, res) => {
  try {
    // Lấy token từ headers
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Không có token, không thể xác thực" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
    } catch (error) {
      return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    // Tìm người dùng dựa vào ID
    const user = await User.findOne({ idUser: decoded.idUser });
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

    const { oldPassword, newPassword } = req.body;

    // Kiểm tra xem mật khẩu cũ có đúng không
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Mật khẩu cũ không chính xác" });

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Lưu mật khẩu mới vào database
    await user.save();

    res.status(200).json({ message: "Cập nhật mật khẩu thành công!" });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật mật khẩu:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// 🟢 Hàm tạo OTP ngẫu nhiên
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// 🟢 API Quên mật khẩu - Gửi OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { emailOrUsername } = req.body;

    // Tìm user theo email hoặc username
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    });

    if (!user) {
      return res.status(400).json({ message: "Tài khoản không tồn tại" });
    }

    // Tạo OTP ngẫu nhiên & thời gian hết hạn (10 phút)
    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Cập nhật OTP vào database
    user.otpCode = otpCode;
    user.otpExpires = otpExpires;
    await user.save();

    // Gửi OTP qua email
    await sendEmail(user.email, "Mã OTP Quên Mật Khẩu", `Mã OTP của bạn là: ${otpCode}`);

    res.status(200).json({ message: "OTP đã được gửi, vui lòng kiểm tra email." });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// 🟢 API Xác thực OTP khi quên mật khẩu
exports.verifyPassOTP = async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }

    if (!user.otpCode || user.otpCode !== otpCode) {
      return res.status(400).json({ message: "Mã OTP không chính xác" });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: "Mã OTP đã hết hạn" });
    }

    // Nếu OTP hợp lệ, trả về xác nhận để tiếp tục đặt lại mật khẩu
    res.status(200).json({ message: "OTP hợp lệ, hãy đặt lại mật khẩu." });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};


// 🟢 API Đặt lại mật khẩu mới
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Xóa OTP sau khi đặt lại mật khẩu thành công
    user.otpCode = null;
    user.otpExpires = null;

    await user.save();

    res.status(200).json({ message: "Mật khẩu đã được đặt lại thành công." });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// 🟢 API yêu cầu đổi mail khác
exports.requestChangeEmail = async (req, res) => {
  try {
    const { idUser, newEmail } = req.body;

    const user = await User.findOne({ idUser });
    if (!user) {
      return res.status(400).json({ message: "Người dùng không tồn tại." });
    }

    // Kiểm tra email mới đã tồn tại chưa
    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists) {
      return res.status(400).json({ message: "Email này đã được sử dụng." });
    }

    // Tạo OTP
    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

    // Cập nhật user với OTP và email mới
    user.newEmail = newEmail;
    user.otpCode = otpCode;
    user.otpExpires = otpExpires;
    await user.save();

    // Gửi OTP đến email mới
    await sendEmail(newEmail, "Xác nhận thay đổi email", `Mã OTP của bạn là: ${otpCode}`);

    res.status(200).json({ message: "OTP đã được gửi tới email mới." });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// 🟢 API xác thực otp đổi mail khác
exports.verifyChangeEmail = async (req, res) => {
  try {
    const { idUser, otpCode, newEmail } = req.body;

    const user = await User.findOne({ idUser });
    if (!user) {
      return res.status(400).json({ message: "Người dùng không tồn tại." });
    }

    if (!user.otpCode || user.otpCode !== otpCode) {
      return res.status(400).json({ message: "Mã OTP không chính xác." });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: "Mã OTP đã hết hạn." });
    }

    if (!newEmail) {
      return res.status(400).json({ message: "Email mới không được để trống." });
    }

    // Kiểm tra xem email mới có bị trùng không
    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists) {
      return res.status(400).json({ message: "Email này đã được sử dụng." });
    }

    // Cập nhật email mới
    user.email = newEmail;
    user.otpCode = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({ message: "Email đã được cập nhật thành công." });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// 🟢 API yêu cầu đổi số điện thoại mới
exports.requestChangePhoneNumber = async (req, res) => {
  try {
    const { idUser, newPhoneNumber } = req.body;

    const user = await User.findOne({ idUser });
    if (!user) {
      return res.status(400).json({ message: "Người dùng không tồn tại." });
    }

    // Kiểm tra số điện thoại mới đã tồn tại chưa
    const phoneExists = await User.findOne({ phone: newPhoneNumber });
    if (phoneExists) {
      return res.status(400).json({ message: "Số điện thoại này đã được sử dụng." });
    }

    // Tạo OTP
    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Lưu OTP vào user
    user.otpCode = otpCode;
    user.otpExpires = otpExpires;
    await user.save();

    // Gửi OTP đến số điện thoại mới
    await sendEmail(user.email, "Xác nhận thay đổi số điện thoại", `Mã OTP của bạn là: ${otpCode}`);

    res.status(200).json({ message: "OTP đã được gửi tới email của bạn." });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// 🟢 API xác thực OTP đổi số điện thoại mới
exports.verifyChangePhoneNumber = async (req, res) => {
  try {
    const { idUser, otpCode, newPhoneNumber } = req.body;

    const user = await User.findOne({ idUser });
    if (!user) {
      return res.status(400).json({ message: "Người dùng không tồn tại." });
    }

    if (!user.otpCode || user.otpCode !== otpCode) {
      return res.status(400).json({ message: "Mã OTP không chính xác." });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: "Mã OTP đã hết hạn." });
    }

    if (!newPhoneNumber) {
      return res.status(400).json({ message: "Số điện thoại mới không được để trống." });
    }

    // Kiểm tra xem số điện thoại mới có bị trùng không
    const phoneExists = await User.findOne({ phone: newPhoneNumber });
    if (phoneExists) {
      return res.status(400).json({ message: "Số điện thoại này đã được sử dụng." });
    }

    // Cập nhật số điện thoại mới
    user.phone = newPhoneNumber;
    user.otpCode = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({ message: "Số điện thoại đã được cập nhật thành công." });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};
