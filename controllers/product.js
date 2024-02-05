const Product = require("../models/Product");
const {validationResult,matchedData}=require("express-validator");

module.exports.addProduct = async (req,res) => {
	const result = validationResult(req);
	if(!result.isEmpty()) return res.status(400).send({error: result.array() })
	const data = matchedData(req);
	const newProduct = new Product(data)
	try {
		const savedProduct = await newProduct.save();
		if(!savedProduct) return res.status(504).send({msg:"Error in saving"})
		return res.status(200).send({result: newProduct, msg: "New product added"})
	} catch (error) {
		return res.status(500).send({error: error})
	}
}

module.exports.getAllActive = async (req, res) => {
	try {
		const findProducts = await Product.find({isActive: true})
		if(!findProducts) return res.status(404).send({msg: "Empty Products"});
		return res.status(200).send({result: findProducts})
	} catch (error) {
		return res.status(500).send({error:error})
	}
};

module.exports.getAllProducts = async (req,res) => {
	try {
		const findProducts = await Product.find()
		if(!findProducts) return res.status(404).send({msg: "Empty Products"});
		return res.status(200).send({results: findProducts});
	} catch (error) {
		return res.status(500).send({error: error})
	}
}


module.exports.getProduct = async (req,res) => {
	try {
		const result = validationResult(req);
		if(!result.isEmpty()) return res.status(400).send({error: result.array()})
		const {productId} = matchedData(req);
		const findProduct = await Product.findOne({_id:productId, isActive:true})
		return res.status(200).send({result: findProduct })
	} catch (error) {
		return res.status(500).send({error:error})
	} 
}

module.exports.updateProduct = async (req,res) => {
	const result = validationResult(req);
	if(!result.isEmpty()) return res.status(400).send({error: result.array()})
	const data = matchedData(req);

	try {
		const updatedProduct = await Product.findByIdAndUpdate(data.productId, {name: data.name,description:data.description,price:data.price},{new: true});
		if(!updatedProduct) return res.status(404).send({msg: "Cannot find the Product"});
		return res.status(200).send({result:updatedProduct, msg:"Updated Successfully!"})
	} catch (error) {
		return res.status(500).send({error: error})
	}

}

module.exports.archiveProduct = async (req,res) => {
	try {
		const result = validationResult(req);
		if(!result.isEmpty()) return res.status(400).send({error: result.array()})
		const data = matchedData(req);
		const findProduct = await Product.findByIdAndUpdate(data.productId, {$set:{isActive: false}},{new:true});
		if(!findProduct) return res.status(404).send({msg: "Cannot find the product"})
		return res.status(200).send({msg:"Archived success!"})
	} catch (error) {
		return res.status(500).send({ error: error })
	}
}

module.exports.activateProduct = async (req,res) => {
	try {
		const result = validationResult(req);
		if(!result.isEmpty()) return res.status(400).send({error: result.array()})
		const data = matchedData(req);
		const findProduct = await Product.findByIdAndUpdate(data.productId, {$set:{isActive: true}},{new:true});
		if(!findProduct) return res.status(404).send({msg: "Cannot find the product"})
		return res.status(200).send({msg:"Activated success!"})
	} catch (error) {
		return res.status(500).send({ error: error })
	}
}

// search by name
module.exports.searchByName = async (req, res) => {
    try {
		const result = validationResult(req)
		if(!result.isEmpty()) return res.status(400).send({error: result.array()});
		const data = matchedData(req);
		const findProducts = await Product.find({name:{$regex: new RegExp(`^${data.name}`,"i")}, isActive:true});
		if(!findProducts.length) return res.status(404).send({msg:"Products not found!"})
		return res.status(200).send({result: findProducts})
    } catch (err) {
        res.status(500).send({ error: err });
    }
};

// search by price
module.exports.searchByPrice = async (req, res) => {
	const result = validationResult(req);
	if(!result.isEmpty()) return res.status(400).send({error: result.array()});
	const data = matchedData(req)
	try {
		const findProducts = await Product.find({price:{$gte: data.min, $lte: data.max}})
		if(!findProducts.length) return res.status(404).send({msg: "No product matched!"})
		return res.status(200).send({result: findProducts});
	} catch (error) {
		return res.status(500).send({error:error})
	}
};

