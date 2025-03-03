const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/profile", verifyToken, async (req, res) => {
  try {
    res.status(200).json({ message: "Lấy thông tin thành công", user: req.user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
});

module.exports = router;
