const RewardPoints = require('../models/RewardPoints');
const User = require('../models/User'); // Import model User

// Controller để cập nhật điểm thưởng của người dùng
exports.updateRewardPoints = async (req, res) => {
  const { idUser } = req.params;
  const { rewardPoints } = req.body;

  if (typeof rewardPoints !== 'number' || rewardPoints < 0) {
    return res.status(400).json({ error: 'Invalid reward points value.' });
  }

  try {
    // Kiểm tra xem có tồn tại entry cho idUser không
    let reward = await RewardPoints.findOne({ idUser });

    if (reward) {
      // Nếu có rồi, cập nhật lại điểm thưởng
      reward.rewardPoints = rewardPoints;
    } else {
      // Nếu chưa có, tạo mới
      reward = new RewardPoints({ idUser, rewardPoints });
    }

    await reward.save(); // Lưu hoặc cập nhật dữ liệu vào DB

    return res.status(200).json({ message: 'Reward points updated successfully.', reward });
  } catch (error) {
    console.error('Error updating reward points:', error);
    return res.status(500).json({ error: 'Server error.' });
  }
};

// Controller để lấy điểm thưởng của người dùng
exports.getRewardPoints = async (req, res) => {
    const { idUser } = req.params;
  
    try {
      const user = await User.findOne({ idUser });
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
  
      let reward = await RewardPoints.findOne({ idUser });
  
      if (!reward) {
        reward = new RewardPoints({
          idUser: user.idUser,
          rewardPoints: user.rewardPoints,
        });
        await reward.save();
        return res.status(201).json({ 
          message: 'Reward points saved to RewardPoints model.',
          rewardPoints: parseFloat(reward.rewardPoints.toString())  // Chuyển thành số trước khi trả về
        });
      }
  
      reward.rewardPoints = user.rewardPoints;
      await reward.save();
  
      return res.status(200).json({
        message: 'Reward points updated in RewardPoints model.',
        rewardPoints: parseFloat(reward.rewardPoints.toString())  // Chuyển thành số trước khi trả về
      });
  
    } catch (error) {
      console.error('Error fetching or saving reward points:', error);
      return res.status(500).json({ error: 'Server error.' });
    }
  };
  
  
