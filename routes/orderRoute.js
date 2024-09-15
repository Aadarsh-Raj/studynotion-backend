const express = require("express");
const orderConroller = require("../controllers/orderController");
const router = express.Router();

router.post("/create/:courseid",orderConroller.createOrder)


module.exports = router;