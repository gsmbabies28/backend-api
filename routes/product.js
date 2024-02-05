const express = require("express");
const router = express.Router();
const productController = require("../controllers/product");
const {validateProduct, validateProductId, validateUpdateProduct, validateProductName, validateProductPrice} = require("../utils/productValidationSchemas.js")
const { checkSchema } = require("express-validator");
const auth = require("../auth");
const {verify, verifyAdmin} = auth;

router.post("/", verify, verifyAdmin, checkSchema(validateProduct), productController.addProduct);

router.get("/all", verify, verifyAdmin, productController.getAllProducts);

router.get("/", productController.getAllActive);

router.get("/:productId",checkSchema(validateProductId), productController.getProduct);

router.patch("/:productId/update",verify, verifyAdmin, checkSchema(validateProductId),checkSchema(validateUpdateProduct), productController.updateProduct);

router.patch("/:productId/archive", verify, verifyAdmin, checkSchema(validateProductId), productController.archiveProduct);

router.patch("/:productId/activate",  verify, verifyAdmin, checkSchema(validateProductId), productController.activateProduct);

//search by name
router.post("/searchByName",checkSchema(validateProductName), productController.searchByName);

router.post("/searchByPrice", checkSchema(validateProductPrice), productController.searchByPrice);



module.exports = router;