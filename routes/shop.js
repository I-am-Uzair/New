const express = require("express");
const shopController = require("../Controllers/shop");
const isAuth = require("../Middleware/is-auth");

const router = express.Router();

router.get("/", shopController.getIndex);
router.get("/products", shopController.getProducts);
router.get("/products/:productId", shopController.getSingleProduct); 

router.post("/cart", isAuth, shopController.postCart); 
router.get("/cart", isAuth, shopController.getCart);
router.get("/checkout", isAuth, shopController.getCheckout );

router.post("/cart-delete-item", isAuth, shopController.postCartDeleteProduct);
router.post("/create-order", isAuth, shopController.postOrder);
router.get("/orders", isAuth, shopController.getOrders); 
// router.get("/checkout", shopController.getCheckout);

module.exports = router;
