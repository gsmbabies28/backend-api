const User = require("../models/User");
module.exports.validateUserRegistration = {
    firstName : {
        isString: {
            erorMessage:
                "Last Name must in a String format"
        },
        trim: true,
        notEmpty: {
            errorMessage:
                "First Name cannot be empty"
        },
        escape: true,
        isLength: {
            options:{
                min: 1,
                max: 50,
            },
            errorMessage: 
                "First Name Contain 50 characters long only"
        }
    },
    lastName: {
        isString: {
            erorMessage:
                "Last Name must in a String format"
        },
        notEmpty: {
            errorMessage:
                "Last Name cannot be empty"
        },
        escape: true,
        isLength: {
            options:{
                min: 1,
                max: 50,
            },
            errorMessage: 
                "Last Name Contain 50 characters long only"
        }
    },
    email:{
        notEmpty:{
            erorMessage:
                "Email cannot be empty"
        },
        isEmail: {
            errorMessage:
                "Please input a valid email"
        },
        custom:{
            options: async (value) => {
                const findEmail = await User.findOne({email:value})
                // console.log("resut"+findEmail);
                if(findEmail) throw new Error("Email is already taken");
                return true;
            }
        }
    },
    password: {
        notEmpty: {
            erorMessage:
                "Password cannot be empty"
        },
        isLength:{
            options:{
                min: 8
            },
            errorMessage:
                "Password must contain atleast 8 characters"
        },
        escape: true,
        isString: {
            errorMessage:
                "Password must be in a string format"
        }
    }, 
    confirmPassword: {
        custom: {
            options: (value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error("Confirm Password must match the Password field");
                }
                return true;
            }
        },
        escape: true,
        isString: {
            errorMessage:
                "Password must be in a string format"
        }
    },
    mobileNo: {
        notEmpty: {
            erorMessage:
                "Mobile cannot be empty"
        },
        isLength:{
            options:{
                min: 11
            },
            errorMessage:
                "Mobile number must contain atleast 11 characters"
        },
        escape: true,
        isString: {
            errorMessage:
                "Mobile must be in a string format"
        }
    }
}

module.exports.validateUserLogin = {
    email: {
        isString:{
            erorMessage:
                "Email must be in string format"
        },
        trim: true,
        notEmpty:{
            errorMessage: 
                "Email can not be empty"
        },
        custom:{
            options: async (value) => {
                const findEmail = await User.findOne({email: value})
                if(!findEmail) throw new Error("Email does not exist");
                return true;
            }
        }
    },
    password: {
        isString :true,
        trim: true,
        notEmpty: true,
        isLength: {
            options: {
                min: 8
            }
        }
    }
}

module.exports.validateNewPassword = {
    newPassword: {
        isString: true,
        trim: true,
        notEmpty: true,
        isLength: {
            options: {
                min: 8
            },
            errorMessage:
            "Password must contain atleast 8 characters"
        }
    },
    confirmPassword: {
        isString: true,
        trim: true,
        notEmpty: true,
        isLength: {
            options: {
                min: 8
            },
            errorMessage:
                "Password must contain atleast 8 characters"
        },
        custom: {
            options: async (value, {req}) => {
                if(value !== req.body.newPassword)
                    throw new Error("Password does not match!")
            }
        }
    }
}