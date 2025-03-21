const Address = require("../models/Address");
const User = require("../models/User"); // Import User model

// 🔹 Thêm địa chỉ mới
exports.addAddress = async (req, res) => {
  try {
    const { idUser, addressLine, city, state, country, isDefault } = req.body;

    // 🔹 Lấy thông tin user từ idUser
    const user = await User.findOne({ idUser });
    if (!user) {
      return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });
    }

    if (isDefault) {
      // Nếu đặt địa chỉ mới là mặc định, bỏ đánh dấu địa chỉ mặc định cũ
      await Address.updateMany({ idUser }, { isDefault: false });
    }

    const newAddress = new Address({
      idUser,
      fullName: user.fullName, // Lưu fullName từ User
      phone: user.phone, // Lưu phone từ User
      addressLine,
      city,
      state,
      country,
      isDefault,
    });

    await newAddress.save();
    res.status(201).json({ success: true, message: "Địa chỉ đã được thêm", data: newAddress });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi khi thêm địa chỉ", error });
  }
};

// 🔹 Lấy danh sách địa chỉ của người dùng
exports.getUserAddresses = async (req, res) => {
  try {
    const { idUser } = req.params;

    const addresses = await Address.find({ idUser }).sort({ isDefault: -1, createdAt: -1 });

    res.status(200).json({ success: true, data: addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi khi lấy địa chỉ", error });
  }
};

// 🔹 Cập nhật địa chỉ
exports.updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { idUser, isDefault } = req.body;

    if (isDefault) {
      // Nếu địa chỉ này được đặt là mặc định, bỏ đánh dấu mặc định của các địa chỉ khác
      await Address.updateMany({ idUser }, { isDefault: false });
    }

    const updatedAddress = await Address.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedAddress) {
      return res.status(404).json({ success: false, message: "Địa chỉ không tồn tại" });
    }

    res.status(200).json({ success: true, message: "Địa chỉ đã được cập nhật", data: updatedAddress });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi khi cập nhật địa chỉ", error });
  }
};

// 🔹 Xóa địa chỉ
exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAddress = await Address.findByIdAndDelete(id);

    if (!deletedAddress) {
      return res.status(404).json({ success: false, message: "Địa chỉ không tồn tại" });
    }

    res.status(200).json({ success: true, message: "Địa chỉ đã được xóa" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi khi xóa địa chỉ", error });
  }
};

// 🔹 Cập nhật địa chỉ mặc định
exports.setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await Address.findById(id);

    if (!address) {
      return res.status(404).json({ success: false, message: "Địa chỉ không tồn tại" });
    }

    // Bỏ đánh dấu mặc định của tất cả các địa chỉ khác của user
    await Address.updateMany({ idUser: address.idUser }, { isDefault: false });

    // Đánh dấu địa chỉ mới là mặc định
    address.isDefault = true;
    await address.save();

    res.status(200).json({ success: true, message: "Địa chỉ mặc định đã được cập nhật", data: address });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi khi cập nhật địa chỉ mặc định", error });
  }
};
