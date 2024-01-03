const User = require("../models/User");



const bcrypt = require("bcrypt");
const auth = require("../auth");
const mongoose = require('mongoose');



module.exports.registerUser = (req,res) => {
    let validUserInput = (userInput => {
    	if (userInput.mobileNo.length !== 11 || !userInput.email.includes("@") || userInput.password.length < 8 ){
    		return false
    	}
    	return true
    })
    if(!validUserInput(req.body)){
    	return res.status(400).send({message: "Invalid user input (ÒДÓױ)"})
    }

    User.findOne({email: req.body.email}).then(result => {

        if (result != null && result.email == req.body.email){
        	return res.status(409).send("Email already exists (ÒДÓױ)")
        } else {
        		// process
        	let newUser = new  User({
        	firstName : req.body.firstName,
        	lastName : req.body.lastName,
        	email : req.body.email,
        	password : bcrypt.hashSync(req.body.password, 10),
            isAdmin : req.body.isAdmin,
        	mobileNo : req.body.mobileNo,
        	})
        	return newUser.save()
        	.then((user)=> res.status(201).send({ message: "Registered Successfully"}))
        }	
    })
    .catch(err => res.status(400).send({message: "All fields must be provided (ÒДÓױ)", error: err }))
}

module.exports.loginUser = (req,res) => {
	return User.findOne({email : req.body.email})
	.then(result => {
		if(result == null){
			return res.status(404).send({ error: "No Email Found (ÒДÓױ)" });
		}
		else{
			const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password); 
			if (isPasswordCorrect == true) {
					return res.status(200).send({ access : auth.createAccessToken(result)})
				} else {
					return res.status(401).send({ message: "Email and password do not match (ÒДÓױ)" });
				}
			
		}
	})
	.catch(err => res.status(500).send({error: "There is an error logging in"}))

}

module.exports.getProfile = (req,res) =>{
	return User.findById(req.user.id)
	.then(result =>{
		if(!result){	
			return res.status(404).send({error: "User not found"});
		} else {
			result.password ="*****"
			return res.status(200).send({result});
		}
		
	})
	.catch(err => res.status(400).send({error: err}))
}

module.exports.updateAdmin = async (req, res) => {
  try {

    if (!req.params.userId) {
      return res.status(400).send({ message: 'User ID is required in the parameter' });
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.userId, { isAdmin: true }, { new: true });

    if (!updatedUser) {
      return res.status(404).send({ message: 'User not found' });
    }

    return res.status(200).send({ message: 'User updated as admin successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports.updatePassword = async (req, res) => {
  try {
    const newPassword = { password : bcrypt.hashSync(req.body.newPassword, 10)};

    await User.findByIdAndUpdate(req.user.id, newPassword);

    res.status(200).send({ message: 'Password updated successfully ┌( ಠ_ಠ)┘' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
};