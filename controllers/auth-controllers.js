const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/users-models");
const SECRET_KEY = process.env.JWT_SECRET;



if (!SECRET_KEY) {
  throw new Error("JWT_SECRET is not defined");
}

exports.login = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    if (!username) {
      throw { msg: "Username required!", code: 400 };
    }

    const user = await User.selectUserByUsername(username);

    if (!password) {
      throw { msg: "Password required!", code: 400 };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw { msg: "Invalid password!", code: 401 };
    }

    const token = jwt.sign(
      { userId: user.user_id, username: user.username },
      SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    res.json({
      token,
      user: {
        id: user.user_id,
        username: user.username,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      throw { msg: "No Authorization header provided!", code: 401 };
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      throw { msg: "Malformed Authorization header!", code: 401 };
    }

    const token = parts[1];
    if (!token) {
      throw { msg: "No token provided!", code: 401 };
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        if (err.name === "JsonWebTokenError") {
          throw { msg: "Invalid token! Authentication Failed", code: 401 };
        } else if (err.name === "TokenExpiredError") {
          throw { msg: "Token expired!", code: 401 };
        } else {
          throw { msg: "Failed to authenticate token!", code: 401 };
        }
      }

      res.send({ msg: "Logged out successfully" });
    });
  } catch (err) {
    next(err);
  }
};
