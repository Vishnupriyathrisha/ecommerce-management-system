require("dotenv").config();

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;


// Create JWT Token
const signToken = (data) => {
    return jwt.sign(
        data,
        JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );
};


// Verify JWT Token
const compareToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};


module.exports = {
    signToken,
    compareToken
};