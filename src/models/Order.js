const mongoose = require("mongoose");
const Product = require("../models/Product");  // Import mô hình Product

const orderSchema = new mongoose.Schema(
  {
    idUser: { type: Number, required: true },
    address: {
      fullName: String,
      phone: String,
      addressLine: String,
      city: String,
      state: String,
      country: String,
    },
    products: [
      {
        productId: { type: String, required: true },
        title: String,
        quantity: Number,
        price: Number,
        image: String,
      },
    ],
    paymentMethod: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 }, // ✅ THÊM DÒNG NÀY
    usedRewardPoints: { type: Number, default: 0 }, // ✅ THÊM DÒNG NÀY
    coupon: { type: String, ref: 'Coupon' },
    status: { type: String, default: "New Order" },
    previousStatus: { type: String, default: null },
    autoConfirmAt: { type: Date, index: true, default: null },
  },
  { timestamps: true }
);


// Middleware để tự động tăng soldCount khi trạng thái đơn hàng là "Delivered"
orderSchema.post('save', async function (doc) {
  // In ra trạng thái của đơn hàng để kiểm tra
  console.log("Order status after save:", doc.status);
  
  if (doc.status === "Delivered") {
    try {
      for (const product of doc.products) {
        const productId = product.productId;
        const quantitySold = product.quantity;

        // In ra chi tiết sản phẩm để kiểm tra
        console.log(`Processing productId: ${productId}, Quantity: ${quantitySold}`);
        
        // Tăng soldCount của sản phẩm
        const updatedProduct = await Product.findOneAndUpdate(
          { id: productId },
          { $inc: { soldCount: quantitySold } }, // Tăng soldCount theo số lượng sản phẩm trong đơn hàng
          { new: true }  // Để lấy lại đối tượng sản phẩm đã cập nhật
        );

        // Kiểm tra nếu sản phẩm đã được cập nhật thành công
        if (updatedProduct) {
          console.log(`Updated soldCount for product ${updatedProduct.title}: ${updatedProduct.soldCount}`);
        } else {
          console.log(`Product with ID ${productId} not found.`);
        }
      }
    } catch (error) {
      console.error("Error updating soldCount:", error);
    }
  }
});

module.exports = mongoose.model("Order", orderSchema);
