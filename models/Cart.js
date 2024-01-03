const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({

	userId: {
		type: String,
		required: [true, "User Id is Required"],
	},
	cartItems: [{
		productId: {
			type: String,
			required: [true, "Product Id is Required"],
		},
		quantity: {
			type : Number,
			required: true
		},
		subtotal: {
			type: Number,
			required: true
		}
	}],
	totalPrice: {
		type: Number,
		required: [true, "totalPrice is Required"]
	},
	orderedOn: {
		type: Date,
		default: Date.now
	},

})

module.exports = mongoose.model("Cart", cartSchema);