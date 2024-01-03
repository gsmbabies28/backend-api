const Product = require("../models/Product");

module.exports.addProduct = (req,res) => {
	Product.findOne({name: req.body.name})
	.then(result => {
		if(result){
			return res.status(409).send({error:"Product already added"})
		} else {
			let newProduct = new Product({
				name : req.body.name,
				description : req.body.description,
				price : req.body.price
			})

			return newProduct.save()
			.then(result => res.status(201).send({result}))
			.catch(err => {
				console.error("Error in adding the product", err)
				return res.status(500).send({error: "Failed to add the product"})
			})


		}
	})
}

module.exports.getAllActive = (req, res) => {
    Product.find({isActive: true})
    .then(result => {
        if (result.length > 0){
            return res.status(200).send({ availableProducts : result });
        }
        else {
            return res.status(200).send({ message: 'No product available.' })
        }
    })
    .catch(err => res.status(500).send({ error: 'Error finding available products.' }));
};

module.exports.getAllProducts = (req,res) => {
	return Product.find({})
	.then(result => { res.status(200).send({products: result})})
	.catch(error => res.status(500).send({error: 'Error finding all products'}));
}


module.exports.getProduct = (req,res) => {
	Product.findById(req.params.productId)
	.then (result => {
		if(!result){
			return res.status(404).send({error: "Product not found"})
		}
		else{
			return res.status(200).send({addedProduct : result})
		}
	})
	.catch(err => {
		console.error("Error in retrieving the product", err);
		return res.status(500).send({error: "Failed to fetch product"})
	})
}

module.exports.updateProduct = (req,res) => {

	let updatedProduct = {
		name : req.body.name,
		description : req.body.description,
		price : req.body.price
	}

	if (!req.body.name || !req.body.description || !req.body.price) {
	     return res.status(400).send({ error: "Missing required fields" });
	 }


	return Product.findByIdAndUpdate(req.params.productId, updatedProduct, {new:true})
	.then(result => {
		if(!result){
			return res.status(404).send({error: "Product not found"})
		} else {
			return res.status(200).send({updatedProduct : result})
		}
	})
	.catch(err => {
			console.log("Error in updating a product: ", err)
			return res.status(500).send({error: "Error in updating a product"})
	})
}

module.exports.archiveProduct = (req,res) => {
	let archivedProduct = {
		isActive : false
	}

	return Product.findByIdAndUpdate(req.params.productId, archivedProduct)
	.then(result => {
		if(!result){
			return res.status(404).send({error: "Product not found"})
		} else {
			if(result.isActive === false){
				return res.status(208).send({message :"Product already archived."})
			}else {
				result.isActive = false
				return res.status(200).send({
				message: "Product archived successfully",
				archiveProduct: result
				})
			}
			
		}	
	})
	.catch(err => {
			console.log("Error in archiving a product: ", err)
			return res.status(500).send({error: "Error in archiving a product"})
		})
}

module.exports.activateProduct = (req,res) => {
	let activatedProduct = {
		isActive : true
	}

	return Product.findByIdAndUpdate(req.params.productId, activatedProduct)
	.then(result => {
		if(!result){
			return res.status(404).send({error: "Product not found"})
		} else {
			if(result.isActive === true){
				return res.status(208).send({message: "Product already activated."})
			}else {
				result.isActive = true
				return res.status(200).send({
				message: "Product activated successfully",
				activateProduct: result
				})
			}
			
		}	
	})
	.catch(err => {
			console.log("Error in activating a product: ", err)
			return res.status(500).send({error: "Error in activating a product"})
		})
}

// search by name
module.exports.searchByName = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).send({ error: "Product name is required" });
        }

        // Case-insensitive search by product name
        const products = await Product.find({ name: { $regex: new RegExp(name, 'i') } });

        if (!products || products.length === 0) {
            return res.status(404).send({ error: "No products found with the given name" });
        }

        res.status(200).send({ products });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message || "Internal Server Error" });
    }
};

// search by price
module.exports.searchByPrice = async (req, res) => {
    try {
        const { minPrice, maxPrice } = req.body;

        if (!minPrice || !maxPrice || isNaN(minPrice) || isNaN(maxPrice)) {
            return res.status(400).send({ error: "Invalid price range provided" });
        }

        // Search for products within the specified price range
        const products = await Product.find({
            price: { $gte: minPrice, $lte: maxPrice }
        });

        if (!products || products.length === 0) {
            return res.status(404).send({ error: "No products found within the given price range" });
        }

        res.status(200).send({ products });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message || "Internal Server Error" });
    }
};

