const User = require("../models/User");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const mongoose = require('mongoose');
const { validationResult, matchedData } = require("express-validator");

// CART
module.exports.getCart = async (req,res)=>{
    const id = req.user.id;
	try{
		const getCart = await Cart.findOne({userId: id})
		if(getCart){
			res.status(200).send({userCart: getCart});
		}else{
			res.status(404).send({message:"Cannot Find User cart"});
		}		
	}
	catch(err){
		res.status(500).send({error:err})
	}
}

//add to cart
module.exports.addToCart = async (req, res) => {
    const result = validationResult(req);
    if(!result.isEmpty()) return res.status(404).send({error: result.array()})
    const data = matchedData(req);
    try {
        const {productId, quantity, subTotal} = data;
        const userId = req.user.id
        const findCartUser = await Cart.findOne({userId: userId})
        if(!findCartUser){
            const newCart = new Cart({userId: userId, cartItems:[data],totalPrice: subTotal})
            const savedCart = await newCart.save();
            if(!savedCart) res.status(500).send({error: "Error in saving data"})
            res.status(200).send(savedCart);
        } else {
            const findExistProduct = findCartUser.cartItems.find(item => item.productId === productId);
            console.log(findExistProduct);
            if(!findExistProduct){
                findCartUser.cartItems.push(data)
                findCartUser.totalPrice += Number(subTotal);
                const savedProduct = await findCartUser.save();
                res.status(200).send(savedProduct)
            } else {
                findExistProduct.quantity += Number(quantity);
                findExistProduct.subTotal += Number(subTotal);
                findCartUser.totalPrice += Number(subTotal);
                const savedProduct = await findCartUser.save();
                res.status(200).send(savedProduct)
            }
        }
    } catch (error) {
        res.status(500).send({error: error.message})
    }
};

module.exports.changeQuantities = async (req,res) =>{
    const result = validationResult(req);
    if(!result.isEmpty()) res.status(400).send({error: result.array()})
    const data = matchedData(req);
	try {
		const userId = req.user.id;
		const{productId, quantity} = data;
        const findUserCart = await Cart.findOne({userId: userId});
        if(!findUserCart) res.status(404).send({msg:"Cannot find the user cart"})
        const findProduct = findUserCart.cartItems.find(product => product.productId === productId);
        if(!findProduct) res.status(404).send({msg: "Product not found"});
        const price = findProduct.subTotal / findProduct.quantity;
        findProduct.quantity = quantity;
        findProduct.subTotal = price*quantity; 
        const newTotalPrice = findUserCart.cartItems.reduce((acc, cValue) => acc + cValue.subTotal, 0);
        findUserCart.totalPrice = newTotalPrice;
        const savedProduct = await findUserCart.save()
        if(!savedProduct) res.status(500).send({error: "Something went wrong"});
        res.status(200).send(savedProduct);
	}catch(err){
		res.status(500).send({error: err.message});	
	}
}

module.exports.removeFromCart = async (req,res) =>{
    const userId = req.user.id;
    const productId = req.params.productId
	try{
        const findUserCart = await Cart.findOne({userId: userId});
        if(!findUserCart) res.status(404).send({error: "Cannot find user cart"})
        if(!mongoose.Types.ObjectId.isValid(productId)) res.status(400).send({error: "Bad request"})
        if(!findUserCart.cartItems.length) res.status(404).send({msg:"Cart is empty"})
        const filterProducts = findUserCart.cartItems.filter(product => product.productId !== productId);
        findUserCart.cartItems = filterProducts;
        const newTotalPrice = filterProducts.reduce((acc,cValue)=>acc+cValue.subTotal,0)
        findUserCart.totalPrice = newTotalPrice;
        const savedProduct = findUserCart.save();
        if(!savedProduct)  res.status(500).send({error:"Error in saving"});
        res.status(200).send(findUserCart);
	}catch(err){
		res.status(500).send({error: err.message});
	}
}

module.exports.clearCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await Cart.findOne({ userId });
        // If no cart is found, send a message to the client
        if (!cart)  res.status(404).send({ message: "Cart not found for the user" });
        // Check if the cartItems array has at least 1 item
        if (cart.cartItems.length > 0) {
            // Remove all items in the cartItems array
            cart.cartItems = [];
            // Update the total price of the cart
            cart.totalPrice = 0;
            // Save the updated cart
            const updatedCart = await cart.save();
            if(!updatedCart) res.status(500).send({error: "Error in saving the data"})
            res.status(200).send(cart);
        } else {
            // Send a message to the client if the cart is already empty
            res.status(200).send({ message: "Cart is already empty" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message || "Internal Server Error" });
    }
};