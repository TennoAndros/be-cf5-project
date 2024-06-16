const genresRouter = require("express").Router();
const { getGenres } = require("../controllers/genres-controllers");

genresRouter.route("/").get(getGenres);

module.exports = genresRouter;
