const User = require("../models/User");
const Cart = require("../models/Cart");
const Order = require("../models/Order")

const mongoose = require('mongoose');


//ORDER
module.exports.checkout = async (req, res) => {
    try {
        // Validate req.user.id
        const userId = req.user.id;

        //Add userFirstName
        const userName = await User.findById(req.user.id);
        const userOrder = `${userName.firstName}'s order`;

        if (!userId) {
            return res.status(400).send({ error: "Invalid user ID" });
        }

        // Find the cart of the user using user's id from the passed token
        const userCart = await Cart.findOne({ userId });

        if (!userCart || userCart.cartItems.length == 0) {
            return res.status(404).send({ error: "No cart found for the user" });
        }

        if (userCart.cartItems.length > 0) {
            // Create a new order document
            const newOrder = new Order({
                userId: userId,
                productsOrdered: userCart.cartItems,
                totalPrice: userCart.totalPrice,
            });

            // Save the new order
            const savedOrder = await newOrder.save();

            // Clearing cart if order
            userCart.cartItems = [];
            userCart.totalPrice = 0;
            await userCart.save();

            //Add userFirstName
            let response = {[userOrder]: savedOrder, message: "Order placed successfully"};

            res.status(201).send(response);
        } else {
            res.status(400).send({ error: "Cart is empty. Add items to the cart before checkout." });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message || "Internal Server Error" });
    }
};

module.exports.myOrders = async (req, res) => {
    try {
        // Validate req.user.id
        const userId = req.user.id;
        if (!userId) {
            return res.status(400).send({ error: "Invalid user ID" });
        }

        // Retrieve the user's orders using req.user.id
        const userOrders = await Order.find({ userId });

        if (!userOrders || userOrders.length === 0) {
            return res.status(404).send({ error: "No orders found for the user" });
        }

        res.status(200).send({ orders: userOrders });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message || "Internal Server Error" });
    }
};

module.exports.getAllOrders = async (req, res) => {
    try {
        // Retrieve all orders
        const allOrders = await Order.find();

        if (!allOrders || allOrders.length === 0) {
            return res.status(404).send({ error: "No orders found" });
        }

        res.status(200).send({ orders: allOrders });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message || "Internal Server Error" });
    }
};