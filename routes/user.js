const express = require("express");
const router = express.Router();
const userController = require("../controllers/user")
const cartController = require("../controllers/cart")
const orderController = require("../controllers/order")

const auth = require("../auth");
// Deconstructured the auth to directly access verify function and verifyAdmin
const {verify, verifyAdmin, isLoggedIn} = auth;

const passport = require("passport");


// ROUTERS FOR USERS
router.post("/", userController.registerUser);

router.post("/login", userController.loginUser);

router.get("/details", verify , userController.getProfile);

router.patch("/:userId/set-as-admin", verify, verifyAdmin, userController.updateAdmin);

router.patch("/update-password", verify, userController.updatePassword);

// ROUTES FOR CART

router.get("/get-cart",verify, cartController.getCart);

router.post("/add-to-cart",verify, cartController.addToCart);


//this is the rout of add to cart v2
router.post("/add-to-cart-v2",verify, cartController.addToCartV2);

router.patch("/update-cart-quantity",verify, cartController.changeQuantities);

router.post("/:productId/remove-from-cart", verify , cartController.removeFromCart);

router.post("/clear-cart", verify , cartController.clearCart);

// ROUTES FOR ORDER

router.post("/checkout", verify, orderController.checkout);

router.post("/my-orders", verify, orderController.myOrders);

router.get("/all-orders", verify, verifyAdmin, orderController.getAllOrders);



module.exports = router;