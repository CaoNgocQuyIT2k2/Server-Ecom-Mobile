const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notificationController');

// Áp dụng middleware cho toàn bộ các route phía dưới
router.use(verifyToken);

// Tạo thông báo mới
router.post('/createNotification', createNotification);

// Lấy danh sách thông báo
router.get('/getNotifications', getNotifications);

// Đánh dấu 1 cái đã đọc
router.put('/:id/read', markAsRead);

// Đánh dấu tất cả đã đọc
router.put('/read-all', markAllAsRead);

// (DEV) Route test socket vẫn có thể để riêng, public hoặc auth tuỳ ý
router.post('/test-socket', (req, res) => {
  const { idUser, title, content, type } = req.body;
  const data = { idUser, title, content, type, createdAt: new Date() };
  const { pushNotificationToUser } = require('../socket');
  pushNotificationToUser(idUser.toString(), data);
  res.json({ message: 'Đã gửi socket đến idUser ' + idUser });
});

module.exports = router;
