const cron = require('node-cron');
const RecentlyViewed = require('./models/RecentlyViewed');

// Chạy cron job mỗi ngày lúc 3h sáng
cron.schedule('0 3 * * *', async () => {
    try {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() - 1); // Xoá sản phẩm quá 14 ngày

        const result = await RecentlyViewed.deleteMany({ viewedAt: { $lt: expiryDate } });
        console.log(`🗑️ Đã xoá ${result.deletedCount} sản phẩm đã xem quá 14 ngày`);
    } catch (error) {
        console.error('❌ Lỗi khi xoá sản phẩm đã xem:', error);
    }
});

console.log('🔄 Cron job xoá sản phẩm đã xem quá 14 ngày đã được kích hoạt!');

// Lên lịch reset coupon vào mỗi sáng thứ Hai
cron.schedule('0 0 * * 1', async () => {
    await UserCoupons.updateMany({}, { $set: { coupons: [] } });
    console.log('Reset coupon data for the week.');
});