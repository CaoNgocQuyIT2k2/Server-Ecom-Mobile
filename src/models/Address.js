const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    idUser: { type: Number, required: true, ref: "User" }, // Liên kết với User
    fullName: { type: String, required: true }, // Thêm fullName
    phone: { type: String, required: true }, // Thêm phone
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true, default: "Vietnam" },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Address", addressSchema);
