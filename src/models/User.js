// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Định nghĩa schema cho người dùng
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Mã hóa mật khẩu trước khi lưu vào MongoDB
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Kiểm tra mật khẩu người dùng
userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
