const mongoose = require('mongoose');
const { Schema } = mongoose;

// Tham chiếu tới model User
const rewardPointsSchema = new Schema({
  idUser: { 
    type: Number,  // Chuyển sang ObjectId
    ref: 'User',  // Tên của model tham chiếu là 'User'
    required: true, 
    unique: true,
  },
  rewardPoints: { 
    type: mongoose.Schema.Types.Decimal128, 
    default: 0 
  },
});

// Tạo model từ schema
const RewardPoints = mongoose.model('RewardPoints', rewardPointsSchema);

module.exports = RewardPoints;
