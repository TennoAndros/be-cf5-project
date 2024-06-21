const usersRouter = require("express").Router();
const authenticateToken = require("../middleware/auth-middleware");

const {
  getUserByUsername,
  postUser,
  deleteUserByUsername,
} = require("../controllers/users-controllers");

const { login, logout } = require("../controllers/auth-controllers");

usersRouter.route("/").post(postUser);
usersRouter
  .route("/:username")
  .get(getUserByUsername)
  .delete(authenticateToken, deleteUserByUsername);

usersRouter.route("/login").post(login);
usersRouter.route("/logout").post(authenticateToken, logout);

module.exports = usersRouter;
