const Product = require("../models/Product");
const mongoose = require('mongoose');

module.exports.validateProducts = {
    productId : {
        custom: {
            options:  async (value) => {
                if(!mongoose.Types.ObjectId.isValid(value)) throw new Error("Invalid product");
                return true
            }
        }
    },
    quantity: {
        isNumeric: true,
    },
    subTotal: {
        isNumeric: true,
    }
}

module.exports.validateChangeQuantity = {
    productId : {
        custom: {
            options:  async (value) => {
                if(!mongoose.Types.ObjectId.isValid(value)) throw new Error("Invalid product");
                return true
            }
        }
    },
    quantity: {
        isNumeric: true,
    }
}

