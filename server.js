const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./src/routes/auth');
const productRoutes = require('./src/routes/productRoutes');
const userRoutes = require('./src/routes/userRoutes');
const addressRoutes = require("./src/routes/address");
const orderRoutes = require("./src/routes/order");
const requestCancelOrderRoutes = require("./src/routes/requestcancelorder");
const reviewRoutes = require("./src/routes/reviewRoutes");
const wishlistRoutes = require("./src/routes/wishlistRoutes");
const viewedProductRoutes = require("./src/routes/viewedProductRoutes");
const couponRoutes = require("./src/routes/couponRoutes");
const recentlyViewedRoutes = require('./src/routes/recentlyViewedRoutes');
const rewardPointsRoutes = require('./src/routes/rewardPointsRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const { initSocket } = require('./socket');

require('dotenv').config();
// require("./orderJob");

const app = express();

// Khởi tạo HTTP server
const server = require('http').createServer(app); // Thêm dòng này để tạo server

app.use(cors());
app.use(bodyParser.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use("/api/user", userRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/requestcancelorder", requestCancelOrderRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/viewedProducts", viewedProductRoutes);
app.use("/api/coupon", couponRoutes);

app.use('/api/recentlyViewed', recentlyViewedRoutes);
app.use('/api/rewardPoints', rewardPointsRoutes);
app.use('/api/notifications', notificationRoutes);

// Khởi tạo socket và truyền server vào
initSocket(server);

// Lắng nghe trên cổng
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
