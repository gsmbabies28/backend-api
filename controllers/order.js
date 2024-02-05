const User = require("../models/User");
const Cart = require("../models/Cart");
const Order = require("../models/Order")

const mongoose = require('mongoose');


//ORDER
module.exports.checkout = async (req, res) => {
    try {
        // Validate req.user.id
        const userId = req.user.id;
        // Find the cart of the user using user's id from the passed token
        const userCart = await Cart.findOne({ userId });
        if(!userCart) res.status(404).send({msg:"No Cart found"})
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
            res.status(201).send(savedOrder);
        } else {
            res.status(404).send({ error: "Cart is empty." });
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
        // Retrieve the user's orders using req.user.id
        const userOrders = await Order.find({ userId }).populate('productsOrdered.productId').exec();
        if (!userOrders || userOrders.length === 0) {
            return res.status(404).send({ error: "No orders found for the user" });
        }
        res.status(200).send( userOrders );
    } catch (err) {
        res.status(500).send({ error: err.message || "Internal Server Error" });
    }
};

module.exports.getAllOrders = async (req, res) => {
    try {
        // Retrieve all orders
        const allOrders = await Order.find().populate('userId',{firstName:1}).populate('productsOrdered.productId').exec();
        if (!allOrders || allOrders.length === 0) {
            return res.status(404).send({ error: "No orders found" });
        }
        res.status(200).send( allOrders );
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message || "Internal Server Error" });
    }
};