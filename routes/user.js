const express = require("express");
const router = express.Router();
const userController = require("../controllers/user")
const cartController = require("../controllers/cart")
const orderController = require("../controllers/order")
const {checkSchema} = require('express-validator')
const {validateUserRegistration, validateUserLogin, validateNewPassword} = require('../utils/userValidationSchemas.js');
const {validateProducts, validateChangeQuantity} = require("../utils/cartValidationSchemas.js")
const auth = require("../auth");
// Deconstructured the auth to directly access verify function and verifyAdmin
const {verify, verifyAdmin, isLoggedIn} = auth;

const passport = require("passport");


// ROUTERS FOR USERS
router.post("/",checkSchema(validateUserRegistration), userController.registerUser);

router.post("/login", checkSchema(validateUserLogin), userController.loginUser);

router.get("/details", verify , userController.getProfile);

router.patch("/:userId/set-as-admin", verify, verifyAdmin, userController.updateAdmin);

router.patch("/update-password", verify, checkSchema(validateNewPassword), userController.updatePassword);

// ROUTES FOR CART

router.get("/get-cart",verify, cartController.getCart);

router.post("/add-to-cart",verify, checkSchema(validateProducts), cartController.addToCart);

router.patch("/update-cart-quantity",verify, checkSchema(validateChangeQuantity), cartController.changeQuantities);

router.post("/:productId/remove-from-cart", verify , cartController.removeFromCart);

router.post("/clear-cart", verify , cartController.clearCart);

// ROUTES FOR ORDER

router.post("/checkout", verify, orderController.checkout);

router.get("/my-orders", verify, orderController.myOrders);

router.get("/all-orders", verify, verifyAdmin, orderController.getAllOrders);



module.exports = router;