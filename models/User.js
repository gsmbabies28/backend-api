const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({ 
    firstName: {
        type: String,
        required: [true, "Please input your firstname"]
    },
    lastName: {
        type: String,
        required: [true, "Please input your lastname"]
    },
    email: {
        type: String,
        required: [true, "Please input your email"]
    },

    password: {
        type: String,
        required: [true, "Please input your password"]
    },
    
    isAdmin: {
        type: Boolean,
        default: false
    },
    
    mobileNo:{
        type: String,
        required: [true, "Please input your mobile number"]
    }
})

module.exports = mongoose.model("User", userSchema);