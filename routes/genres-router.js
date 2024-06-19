const genresRouter = require("express").Router();
const { getGenres, postGenre } = require("../controllers/genres-controllers");
const authenticateToken = require("../middleware/auth-middleware");

genresRouter.route("/").get(getGenres).post(authenticateToken,postGenre);

module.exports = genresRouter;
