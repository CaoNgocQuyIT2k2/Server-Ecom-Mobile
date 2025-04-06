const express = require("express");
const router = express.Router();
const { toggleWishlist, getWishlist, removeFromWishlist } = require("../controllers/wishlistController");

router.post("/toggleWishlist", toggleWishlist);
router.get("/getWishlist/:idUser", getWishlist);
router.delete("/removeFromWishlist", removeFromWishlist);
module.exports = router;
