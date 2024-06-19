const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).send({
      msg: "No Authorization header or No Authentication Token provided!",
    });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).send({ msg: "Malformed Authorization header!" });
  }

  const token = parts[1];
  if (!token) {
    return res.status(401).send({ msg: "No token provided!" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === "JsonWebTokenError") {
        return res.status(401).send({ msg: "Invalid token! Authentication Failed" });
      } else if (err.name === "TokenExpiredError") {
        return res.status(401).send({ msg: "Token expired!" });
      } else {
        return res.status(401).send({ msg: "Failed to authenticate token!" });
      }
    }

    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
