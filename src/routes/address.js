const express = require("express");
const { addAddress, getUserAddresses, updateAddress, deleteAddress, setDefaultAddress } = require("../controllers/addressController");
const router = express.Router();

router.post("/add", addAddress);
router.get("/:idUser", getUserAddresses);
router.put("/update/:id", updateAddress);
router.delete("/delete/:id", deleteAddress);
router.put("/set-default/:id", setDefaultAddress);


module.exports = router;
