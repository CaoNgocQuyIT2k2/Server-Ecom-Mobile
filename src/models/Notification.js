const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  idUser: {
    type: Number, // idUser là kiểu Number, ví dụ như 10015
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String, // loại thông báo, ví dụ như 'promotion', 'order', v.v.
    required: true,
  },
  image: {
    type: String, // ảnh sản phẩm, nếu có
    default: null,
  },
  orderId: {
    type: String, // ID của đơn hàng, nếu có
    default: null,
  },
  status: {
    type: String, // Trạng thái đơn hàng, nếu có
    default: null,
  },
  statusText: {
    type: String, // Nội dung trạng thái đơn hàng, nếu có
    default: null,
  },
  isRead: {
    type: Boolean,
    default: false, // Mặc định là chưa đọc
  },
  createdAt: {
    type: Date,
    default: Date.now, // Mặc định là thời gian hiện tại khi tạo thông báo
  },
});

const Notification = mongoose.model("Notification", NotificationSchema);

module.exports = Notification;
