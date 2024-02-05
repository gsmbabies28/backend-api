const User = require("../models/User");
const { validationResult, matchedData } = require("express-validator");
const bcrypt = require("bcrypt");
const auth = require("../auth");
const mongoose = require("mongoose");


module.exports.registerUser = async (req, res) => {
	const result = validationResult(req);
	if (!result.isEmpty()) {
		return res.status(400).send({ error: result.array() });
	}
	const data = matchedData(req);
	const { firstName, lastName, email, password, mobileNo } = data;
	const newUser = new User({
		firstName: firstName,
		lastName: lastName,
		email: email,
		password: bcrypt.hashSync(password, 10),
		mobileNo: mobileNo,
	});
	try{
		const savedUser = await newUser.save();
		if(savedUser) return res.status(200).send({msg: "You have successfuly registered"})
		return res.status(500).send({error:"Error in registering!"})
	}catch(err){
		return res.status(500).send({error: err.message})
	}
};

module.exports.loginUser = async (req, res) => {
	const result = validationResult(req);
	if(!result.isEmpty()) return res.status(400).send({errors: result.array()});
	const data = matchedData(req);
	const {email, password} = data;
	try {
		const findUser = await User.findOne({email});
		const isPasswordCorrect = await bcrypt.compare(password, findUser.password);
		if(!isPasswordCorrect) return res.status(400).send({msg: "Password do not match"});
		return res.status(200).send({token : auth.createAccessToken(findUser)})
	} catch (error) {
		return res.status(500).send({error:error})
	}
};

module.exports.getProfile = async (req, res) => {
	const {id} = req.user;
	const findUser = await User.findById(id,{password:0})
	if(!findUser) return res.status(400).send({msg: "Cannot find the User details"})
	return res.status(200).send({details: findUser})
};

module.exports.updateAdmin = async (req, res) => {
	const { userId } = req.params;
	try {
		if (!mongoose.Types.ObjectId.isValid(userId)) 
		return res.status(400)
			.send({ message: "Invalid Id" });
		
		const updatedUser = await User.findByIdAndUpdate(userId,
		{ isAdmin: true },
		{ new: true }
		);

		if (!updatedUser) {
		return res.status(404).send({ message: "User not found" });
		}

		return res
		.status(200)
		.send({ message: "User updated as admin successfully" });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Internal Server Error" });
	}
};

module.exports.updatePassword = async (req, res) => {
	const result = validationResult(req);
	
	if(!result.isEmpty()) return res.status(400).send({error:result.array()});
 	try {
	const data = matchedData(req);
    const newPassword = { password: bcrypt.hashSync(data.newPassword, 10) };

    const updatedPassword = await User.findByIdAndUpdate(req.user.id, newPassword);

	if(!updatedPassword) return res.status(404).send({msg:"Cannot find the user"})

    res.status(200).send({ message: "Password updated successfully"});

	} catch (error) {
		console.error(error);
		res.status(500).send({ message: "Internal server error" });
	}
};
