const genresRouter = require("express").Router();
const { getGenres, postGenre } = require("../controllers/genres-controllers");

genresRouter.route("/").get(getGenres).post(postGenre);

module.exports = genresRouter;
