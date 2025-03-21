const mongoose = require("mongoose");
const cron = require("node-cron");
const Order = require("./src/models/Order");
const moment = require("moment");

// ✅ Kết nối MongoDB
mongoose.connect("mongodb://localhost:27017/EcomProject");

// 📌 Chạy cron job kiểm tra đơn hàng mỗi phút
cron.schedule("* * * * *", async () => {
    try {
        const now = new Date();
        console.log(`🕒 Kiểm tra đơn hàng vào lúc: ${moment(now).format("HH:mm:ss")}`);

        const orders = await Order.find({ status: "New Order", autoConfirmAt: { $lte: now } });

        if (orders.length === 0) {
            console.log("🚫 Không có đơn hàng nào cần cập nhật.");
        }

        for (let order of orders) {
            console.log(`🔄 Đang cập nhật đơn hàng: ${order._id}`);
            order.status = "Confirmed";
            await order.save();
            console.log(`✅ Đơn hàng ${order._id} đã được tự động xác nhận.`);
        }
    } catch (error) {
        console.error("❌ Lỗi khi cập nhật trạng thái đơn hàng:", error);
    }
});


// Cài đặt pm2 (nếu chưa có):
// sh
// npm install -g pm2

// Chạy orderJob.js dưới dạng process nền:
// sh
// pm2 start orderJob.js --name "OrderJob"

// Đảm bảo nó tự động chạy sau khi restart server:
// sh
// pm2 save
// pm2 startup

// Kiểm tra trạng thái:
// sh
// pm2 list

// Dừng hoặc xóa nếu cần:
// sh
// pm2 stop OrderJob
// pm2 delete OrderJob