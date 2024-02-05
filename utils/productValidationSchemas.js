const Product = require("../models/Product");
const mongoose = require('mongoose')
module.exports.validateProduct = {
    name: {
        isString: true,
        trim: true,

        notEmpty: {
            errorMessage: "Name cannot be empty"
        },
        custom: {
            options: async (value) => {
                const findProduct = await Product.findOne({name:value})
                if(findProduct) throw new Error("Product already exist")
                return true;
            }   
        }
    },
    description: {
        isString: true,
        trim: true,
        
        notEmpty: {
            errorMessage: "Description cannot be empty"
        }
    },
    price: {
        isNumeric: true,
        trim: true,
        
        notEmpty: {
            errorMessage : "Price cannot be empty"
        }
    }
}

module.exports.validateProductId = {
    productId: {
        isString: true,
        trim: true,
        notEmpty: true,

        custom : {
            options : (value) => {
                if(!mongoose.Types.ObjectId.isValid(value)) throw new Error('Invalid Id')
                return true
            }
        }
    }
}

module.exports.validateUpdateProduct = {
    name: {
        isString: true,
        trim: true,

    },
    description: {
        isString: true,
        trim: true,

    },
    price: {
        isNumeric: true,
        trim: true,
        
    }
}

module.exports.validateProductName = {
    name: {
        isString: true,
        trim: true,
        
    },
}

module.exports.validateProductPrice = {
    min: {
        isNumeric: true,
        trim: true,
        
    },
    max: {
        isNumeric: true,
        trim: true,
        
    }
}