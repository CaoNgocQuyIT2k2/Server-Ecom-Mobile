const express = require('express');
const { updateRewardPoints, getRewardPoints } = require('../controllers/rewardPointsController');
const router = express.Router();

// Route cập nhật điểm thưởng
router.put('/updateRewardPoints/:idUser', updateRewardPoints);

// Route lấy điểm thưởng của người dùng
router.get('/getRewardPoints/:idUser', getRewardPoints);

module.exports = router;
