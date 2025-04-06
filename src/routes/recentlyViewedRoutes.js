const express = require('express');
const { saveRecentlyViewed, getRecentlyViewed } = require('../controllers/recentlyViewedController');
const router = express.Router();

// Route lưu sản phẩm đã xem
router.post('/saveRecentlyViewed', saveRecentlyViewed);
router.get("/getRecentlyViewed/:idUser", getRecentlyViewed);

module.exports = router;
