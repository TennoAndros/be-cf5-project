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

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: "none",
    });

    res.json({
      user: {
        id: user.user_id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        avatar_url: user.avatar_url,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    res.clearCookie("access_token");
    res.send({ msg: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};
