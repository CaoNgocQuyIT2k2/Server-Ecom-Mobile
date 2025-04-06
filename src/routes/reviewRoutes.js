const express = require("express");
const { createReview, getProductReviews, getTotalReviews, checkReviewStatus, get3LatestProductReviews } = require("../controllers/reviewController");

const router = express.Router();

router.post("/createReview", createReview);
router.get("/getProductReview/:productId", getProductReviews);
router.get("/get3LatestProductReviews/:productId", get3LatestProductReviews);

router.get("/getTotalReview/:productId", getTotalReviews);
router.get("/checkReview/:orderId/:idUser", checkReviewStatus);

module.exports = router;
