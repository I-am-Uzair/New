const express = require("express");
const router = express.Router();
const authController = require("../Controllers/auth");
const { check, body } = require("express-validator");
const User = require("../Models/user");

router.get("/login", authController.getLoginPage);
router.post("/login", authController.postLogin);
router.post("/logout", authController.postLogout);
router.get("/signup", authController.getSignUp);
router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please Enter a Valid Email")
      .normalizeEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "E-mail Already Registered Please pick different one."
            );
          }
        });
      }),
    body(
      "password",
      "Please Enter a Password with only Numbers and Text and atleast 5 character long"
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Password have to match!");
        }
        return true;
      }),
  ],
  authController.postSingUp
);
router.get("/reset", authController.getResetPassword);
router.post("/reset", authController.postResetPassword);
router.get("/reset/:token", authController.getNewPassword);
router.post("/new-password", authController.postNewPassword);

module.exports = router;

// MAngoosDB!1730!!
