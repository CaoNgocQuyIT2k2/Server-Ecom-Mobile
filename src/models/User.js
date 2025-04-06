const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
  idUser: { type: Number, unique: true }, // ID tự động tăng
  fullName: { type: String, default: "" }, // Không bắt buộc
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  phone: { type: String, default: "" }, // Không bắt buộc
  password: { type: String, required: true }, // Không hash lại ở đây
  avatar: { type: String, default: null }, // Ảnh đại diện, cập nhật sau
  isVerified: { type: Boolean, default: false }, // Xác thực tài khoản
  otpCode: { type: String, default: null }, // 🔥 Mã OTP gửi qua email
  otpExpires: { type: Date, default: null }, // 🔥 Thời gian hết hạn OTP
  rewardPoints: { type: mongoose.Schema.Types.Decimal128, default: 0 }

});

// Middleware tự động tăng idUser
userSchema.pre("save", async function (next) {
  if (!this.idUser) {
    const lastUser = await mongoose.model("User").findOne().sort({ idUser: -1 }).lean();
    this.idUser = lastUser ? lastUser.idUser + 1 : 10001;
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
