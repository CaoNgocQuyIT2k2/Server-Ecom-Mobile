const Notification = require('../models/Notification');
const { pushNotificationToUser } = require('../../socket');

exports.createNotification = async (req, res) => {
  const { title, content, type } = req.body;
  const idUser = req.body.idUser || req.user.idUser;  // Lấy idUser từ request, nếu không có thì từ user đã xác thực

  // Các thuộc tính tùy chọn khác
  const { image = null, orderId = null, status = null, statusText = null } = req.body;

  try {
    // Tạo thông báo mới với các thuộc tính cơ bản và tùy chọn
    const noti = await Notification.create({
      idUser,
      title,
      content,
      type,
      image,
      orderId,
      status,
      statusText
    });

    // Gửi thông báo qua socket cho người dùng
    pushNotificationToUser(idUser.toString(), noti); // đảm bảo socket join room theo chuỗi

    // Trả về thông báo vừa tạo
    res.json(noti);
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({
      success: false,
      message: "Error creating notification",
      error: error.message,
    });
  }
};


exports.getNotifications = async (req, res) => {
  try {
    const list = await Notification.find({ idUser: req.user.idUser }) // Lọc theo idUser
      .sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo, mới nhất trước

    // Trả về danh sách thông báo
    res.json({
      success: true,
      data: list,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: error.message,
    });
  }
};


exports.markAsRead = async (req, res) => {
  try {
    const updated = await Notification.findOneAndUpdate(
      { _id: req.params.id, idUser: req.user.idUser },
      { isRead: true },
      { new: true }  // Trả về thông báo đã được cập nhật
    );
    if (!updated) {
      return res.status(404).json({ message: 'Notification not found or already read' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification', error });
  }
};

exports.markAllAsRead = async (req, res) => {
  await Notification.updateMany({ idUser: req.user.idUser }, { isRead: true });
  res.json({ message: 'All marked as read' });
};
