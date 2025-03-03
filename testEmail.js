const sendEmail = require("./src/utils/sendEmail");

sendEmail("user@example.com", "Test Email", "Xin chào, đây là email test!")
  .then(() => console.log("✅ Email gửi thành công!"))
  .catch(err => console.error("❌ Lỗi gửi email:", err));
