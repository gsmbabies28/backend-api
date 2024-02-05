const jwt = require("jsonwebtoken");

const secret = "e-commerce";

module.exports.createAccessToken = (user) => {
	//payload
	const data = {
		id: user._id,
		email: user.email,
		isAdmin: user.isAdmin
	};
	return jwt.sign(data, secret, {expiresIn: 7 * 24 * 60 * 60})
}

// function to verify the token
module.exports.verify = (req, res, next) => {
    let token = req.headers.authorization;
    if(!token){
        return res.status(403).send({ auth: "Failed. No Token" });
    } else {
        token = token.slice(7, token.length);
        jwt.verify(token, secret, function(err, decodedToken)
        {
            //If there was an error in verification, an erratic token, a wrong secret within the token, we will send a message to the client.
            if(err){
                return res.status(401).send({
                    auth: "Failed",
                    message: err.message
                });
            } else {
                req.user = decodedToken;
                // next() is an expressJS function which allows us to move to the next function in the route. It also passes details of the request and response to the next function/middleware.
                next();
            }
        })
    }
};

module.exports.verifyAdmin = (req, res, next) => {
	if(req.user.isAdmin){
		next();
	} else {
		// Else, end the request-response cycle by sending the appropriate response and status code.
		return res.status(403).send({
			auth: "Failed",
			message: "Action Forbidden"
		})
	}

}

// Middleware to check if the user is authenticated
module.exports.isLoggedIn = (req,res,next) => {
    if(req.user){
        next();
    }else{
        res.sendStatus(401)
    }
}