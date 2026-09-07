const { compareToken } = require("../helpers/jwtHelper");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("Authorization:", authHeader);

    if (!authHeader) {
      return res.status(401).json({
        message: "Token is required",
      });
    }

    const token = authHeader.split(" ")[1];

    console.log("Token:", token);

    if (!token) {
      return res.status(401).json({
        message: "JWT token is required",
      });
    }

    const decoded = compareToken(token);

    console.log("Decoded:", decoded);

    req.userDetails = {
      _id: decoded._id,
      email: decoded.email,
      role: decoded.role,
    };

    next();

  } catch (error) {
    console.log("JWT ERROR:", error.message);

    return res.status(401).json({
      message: error.message,
    });
  }
};

module.exports = authMiddleware;