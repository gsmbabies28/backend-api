const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
	userId : {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: [true, "User Id is Required"],

	},
	productsOrdered : [{
		productId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Product',
			required: [true, "Product Id is Required"],
		},
		quantity: {
			type: Number,
			required: true
		},
		subTotal: {
			type: Number,
			required: true
		}
	}],
	totalPrice: {
		type: Number,
		required: [true, "totalPrice is Required"]
	},
	orderedOn: {
		type : Date,
		default : Date.now
	},
	status : {
		type: String,
		default : "Pending"
	}
})

module.exports = mongoose.model("Order", orderSchema);
