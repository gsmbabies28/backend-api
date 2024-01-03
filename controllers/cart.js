const User = require("../models/User");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const mongoose = require('mongoose');

// CART

module.exports.getCart = async (req,res) => {

    const userName = await User.findById(req.user.id);
    const userCart = `${userName.firstName}'s cart`;

    // add condition if empty cart
	return Cart.find({userId : req.user.id})
	.then(result =>{
			if(!result || result.length === 0 || result[0].cartItems.length === 0){	
				return res.status(404).send({Message: "No items in the Cart"});
			} else {
                //Add userFirstName
                let response = {[userCart]: result};

				return res.status(200).send(response);
			}
	})
		.catch(err => res.status(400).send({error: err}))
}

//add to cart
module.exports.addToCart = async (req, res) => {
    try {
        const { cartItems, totalPrice } = req.body;
        const { productId, quantity } = cartItems[0];
        const userName = await User.findById(req.user.id);
        const userCart = `${userName.firstName}'s cart`;

        // Validate productId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).send({ error: "Invalid product ID" });
        }

        // Check if the product is active
        const result = await Product.findById(productId);

        if (!result || !result.isActive) {
            return res.status(400).send({ error: "Product not available in the store" });
        }

        let existingCart = await Cart.findOne({ userId: req.user.id });

        if (existingCart) {
            // Check if the product is already in the cart
            const existingCartItem = existingCart.cartItems.find(item => item.productId === productId);

            if (existingCartItem) {
                // Update quantity and subtotal for existing product
                existingCartItem.quantity += quantity;
                existingCartItem.subtotal += result.price * quantity;
            } else {
                // Add new product to cart
                existingCart.cartItems.push({
                    productId: productId,
                    quantity: quantity,
                    subtotal: result.price * quantity,
                });
            }

            existingCart.totalPrice += totalPrice;
            existingCart = await existingCart.save();

            //Add userFirstName
            let response = {[userCart]: existingCart};

            res.status(200).send(response);
        } else {
            // Create a new cart
            const newCart = new Cart({
                userId: req.user.id,
                cartItems: [
                    {
                        productId: productId,
                        quantity: quantity,
                        subtotal: result.price * quantity,
                    },
                ],
                totalPrice: totalPrice,
            });

            const savedCart = await newCart.save();
            if (savedCart) {
                
                //Add userFirstName
                let response = {[userCart]: savedCart};

                res.status(201).send(response);
            } else {
                res.status(500).send({ error: "Error in saving" });
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message || "Internal Server Error" });
    }
};

/*

Add to cart version 2 will accept an array of products and checks if it is existing or valid object
    - sample input in postman with array of products.
    - no need to input the total price it will automatically compute all the subtotal.
        {
            "cartItems":[{
                "productId" : "658137b2e9d701ebd40f21d1",
                "quantity" : 2,
                "subtotal" : 6
            },
            {
                "productId" : "65813751e9d701ebd40f21c8",
                "quantity" : 1,
                "subtotal" : 25
            }]
        }

*/

module.exports.addToCartV2 = async (req,res) =>{
    try{
        const {cartItems, totalPrice} = req.body;
        let productTrue = false;
        for(let i in cartItems){
            if (!mongoose.Types.ObjectId.isValid(cartItems[i].productId)) {
                return res.status(400).send({ error: "Invalid product ID" });
            }else{
                let productFind = await Product.findById(cartItems[i].productId);
                    if(!productFind){
                        productTrue = false;
                        return res.status(404).send({message:"Cannot find Products!"});
                    }else{
                        productTrue = true;
                    }
            }
        }
        console.log(productTrue);
        if(productTrue !== true){
            return res.status(403).send("You are not authorized to access this site!");
        }else{
            let userCart = await Cart.findOne({userId:req.user.id});
            if(!userCart){
                let totalPriceOfEach = cartItems.reduce((acc,cValue)=>acc+cValue.subtotal,0);       
                let newCart = new Cart({
                    userId : req.user.id,
                    cartItems: cartItems,
                    totalPrice: totalPriceOfEach
                });
                let savedCart = await newCart.save();
                if(savedCart){
                    res.status(200).send({userCart:savedCart});
                }else{
                    res.status(403).send({error: "error in saving"})
                }
            }else{
                let checkingProduct = async () =>{
                    let everyProduct = await Cart.findOne({ userId: req.user.id }); 
                        for (const obj of cartItems) {
                            // If the product exists in the cart, find the item and update its quantity
                            const existingItem = everyProduct.cartItems
                                                .find(item => item.productId === obj.productId);
                            if (existingItem) {
                               existingItem.quantity += obj.quantity;
                               existingItem.subtotal += obj.subtotal;
                               everyProduct.totalPrice += obj.subtotal;
                            } else {
                               everyProduct.cartItems.push(obj);
                               everyProduct.totalPrice += obj.subtotal;
                            }
                            await everyProduct.save();
                        }
                    return everyProduct;
                }
                checkingProduct().then(result=>res.status(200).send(result)).catch(err=>{error:err});
            }
        }
    }catch(err){
        res.status(500).send({error:err});
    }
}   


module.exports.changeQuantities = async (req, res) => {
    try {
        const { productId, quantity, subtotal } = req.body;
        const userId = req.user.id;
        const userName = await User.findById(req.user.id);
        const userCart = `${userName.firstName}'s cart`;

        // Find the cart for the current user
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            // If no cart is found, send a message to the client
            return res.status(404).send({ message: "Cart not found for the user" });
        }

        // Check if the cartItems array contains the product ID
        const cartItemIndex = cart.cartItems.findIndex(item => item.productId === productId);

        if (cartItemIndex !== -1) {
            // Update quantity and subtotal if the product is already in the cart
            cart.cartItems[cartItemIndex].quantity = quantity;
            cart.cartItems[cartItemIndex].subtotal = subtotal;
        } else {
            // Add the product to the cart if not present
            cart.cartItems.push({ productId, quantity, subtotal });
        }

        // Recalculate total price based on updated cart items
        cart.totalPrice = cart.cartItems.reduce((total, item) => total + item.subtotal, 0);

        // Save the updated cart
        const updatedCart = await cart.save();

        //Add userFirstName
        let response = {[userCart]: updatedCart};


        res.status(200).send(response);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message || "Internal Server Error" });
    }
};


module.exports.removeFromCart = async (req, res) => {
    try {
        const productIdToRemove = req.params.productId;
        const userId = req.user.id;

        const userName = await User.findById(req.user.id);
        const userCart = `${userName.firstName}'s cart`;

        // Find the cart for the current user
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            // If no cart is found, send a message to the client
            return res.status(404).send({ message: "Cart not found for the user" });
        }

        // Check if the cartItems array contains the product ID
        const cartItemIndex = cart.cartItems.findIndex(item => item.productId === productIdToRemove);

        if (cartItemIndex !== -1) {
            // Remove the item from the cartItems array
            cart.cartItems.splice(cartItemIndex, 1);

            // Recalculate total price based on updated cart items
            cart.totalPrice = cart.cartItems.reduce((total, item) => total + item.subtotal, 0);

            // Save the updated cart
            const updatedCart = await cart.save();

            //Add userFirstName
            let response = {[userCart]: updatedCart};

            res.status(200).send(response);
        } else {
            // Send a message to the client if the product is not found in the cart
            res.status(404).send({ message: "Product not found in the cart" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message || "Internal Server Error" });
    }
};

module.exports.clearCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const userName = await User.findById(req.user.id);
        const userCart = `${userName.firstName}'s cart`;

        // Find the cart for the current user
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            // If no cart is found, send a message to the client
            return res.status(404).send({ message: "Cart not found for the user" });
        }

        // Check if the cartItems array has at least 1 item
        if (cart.cartItems.length > 0) {
            // Remove all items in the cartItems array
            cart.cartItems = [];

            // Update the total price of the cart
            cart.totalPrice = 0;

            // Save the updated cart
            const updatedCart = await cart.save();

            //Add userFirstName
            let response = {[userCart]: updatedCart, message: "Cart cleared successfully"};

            res.status(200).send(response);
        } else {
            // Send a message to the client if the cart is already empty
            res.status(200).send({ message: "Cart is already empty" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message || "Internal Server Error" });
    }
};