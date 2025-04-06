const express = require('express');
const { getSaleProducts, getProducts, getCategories, getTop10Sold, searchProducts, getProductRating, getProductById, getSimilarProducts, countUniqueBuyers, getProductByMongoId } = require('../controllers/productController');

const router = express.Router();

router.get('/saleProducts', getSaleProducts);
router.get('/products', getProducts);
router.get('/categories', getCategories);
router.get('/top10Sold', getTop10Sold);
router.get('/searchProducts', searchProducts);
// Route lấy số sao trung bình của sản phẩm
router.get("/:id/rating", getProductRating);
router.get('/getProductById/:id', getProductById);
router.get('/getSimilarProducts/:productId', getSimilarProducts );
router.get("/unique-buyers/:productId", countUniqueBuyers);
router.get('/getProductByMongoId/:id', getProductByMongoId);


getProductById
module.exports = router;
