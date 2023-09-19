const express = require("express");
const adminController = require("../Controllers/admin");
const { body } = require("express-validator");
const isAuth = require("../Middleware/is-auth");

const router = express.Router();
// const products = [];

// // /admin/add-product => GET
router.get("/add-product", isAuth, adminController.getAddProduct);
// // /admin/products => GET
router.get(
  "/products",

  isAuth,
  adminController.getAdminProducts
);

// // /admin/add-product => POST
router.post(
  "/add-product",
  [
    body("title")
      .isString()
      .isLength({ min: 3 })
      .trim()
      .withMessage("Please Enter a Valid Title atleat 3 Character long"),
    // body("imageUrl").isURL().withMessage("Please Enter A Valid URL"),
    body("price")
      .isFloat()
      .withMessage("Please Enter A Price In Decimal Point"),
    body("description")
      .isLength({ min: 3, max: 400 })
      .trim()
      .withMessage(
        "Please Enter a Description with minimun 3 character and maximum 400 charchter long"
      ),
  ],
  isAuth,
  adminController.postAddProduct
);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post(
  "/edit-product",
  [
    body("title")
      .isString()
      .isLength({ min: 3 })
      .trim()
      .withMessage("Please Enter a Valid Title atleat 3 Character long"),
    // body("imageUrl").isURL().withMessage("Please Enter A Valid URL"),
    body("price")
      .isFloat()
      .withMessage("Please Enter A Price In Decimal Point"),
    body("description")
      .isLength({ min: 3, max: 400 })
      .trim()
      .withMessage(
        "Please Enter a Description with minimun 3 character and maximum 400 charchter long"
      ),
  ],
  isAuth,
  adminController.postEditProduct
);
router.delete("/product/:productId", isAuth, adminController.deleteProduct);

module.exports = router;
// exports.routes = router;
// exports.products = products;
