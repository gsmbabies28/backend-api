// Dependencies
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");

require("dotenv").config();

const passport = require("passport");
const session = require("express-session");
require("./passport");

// const port = 4004;


const cors = require("cors");

const app = express();

// Moddilewares
app.use(express.json());
app.use(cookieParser("e-commerce"))
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use(bodyParser.json());

app.use(session({
	secret: process.env.clientSecret,
	resave: false,
	saveUninitialized: false,
	// cookie:{
	// 	maxAge: 60000 * 60
	// }, 
}))

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGO_DB_SERV, 
	{
		useNewUrlParser: true, 
		useUnifiedTopology: true, 
	});

app.get("/b5", (req, res) => {
	res.send("Hello world")
})
app.use("/b5/users", userRoutes);
app.use("/b5/products", productRoutes);

mongoose.connection.once("open", () => console.log("Now connected to MongoDB Atlas"));



app.listen(process.env.PORT || 4005, () => {console.log(`API is now online on port ${process.env.PORT||4004}`)});