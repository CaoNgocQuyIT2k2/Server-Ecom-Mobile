const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./src/routes/auth');
const productRoutes = require('./src/routes/productRoutes');
const userRoutes = require('./src/routes/userRoutes');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use("/api/user", userRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
