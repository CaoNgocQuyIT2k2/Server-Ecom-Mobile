const express = require('express');
const { getSaleProducts, getProducts, getCategories, getTop10Sold } = require('../controllers/productController');

const router = express.Router();

router.get('/saleProducts', getSaleProducts);
router.get('/products', getProducts);
router.get('/categories', getCategories);
router.get('/top10Sold', getTop10Sold);

module.exports = router;
