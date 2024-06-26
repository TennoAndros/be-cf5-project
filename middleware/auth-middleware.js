const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET;

if (!SECRET_KEY) {
  throw new Error("JWT_SECRET is not defined");
}

const authenticateToken = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).send({
      msg: "No Authentication Token provided!",
    });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
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
