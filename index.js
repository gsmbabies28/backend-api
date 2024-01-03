// Dependencies
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');

const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");

require("dotenv").config();

const passport = require("passport");
const session = require("express-session");
require("./passport");

const port = 4004;


const cors = require("cors");

const app = express();

// Moddilewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use(bodyParser.json());

app.use(session({
	secret: process.env.clientSecret,
	resave: false,
	saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());



mongoose.connect("mongodb+srv://admin:admin@b335-manlapaz.efc2cv4.mongodb.net/pogi-sige-na-store", 
	{
		useNewUrlParser: true, 
		useUnifiedTopology: true, 
	});

app.get("/b4", (req, res) => {
	res.send("Hello world")
})
app.use("/b4/users", userRoutes);
app.use("/b4/products", productRoutes);

mongoose.connection.once("open", () => console.log("Now connected to MongoDB Atlas (   ° ᴗ°)~ð"));



app.listen(process.env.PORT || port, () => {console.log(`API is now online on port ${ process.env.PORT ||port}`)});