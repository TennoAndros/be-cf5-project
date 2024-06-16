const apiRouter = require("express").Router();

const { getEndpoints } = require("../controllers/api-controllers");

const genresRouter = require("./genres-router");
const booksRouter = require("./books-router");
const reviewsRouter = require("./reviews-router");

apiRouter.get("/", getEndpoints);
apiRouter.use("/genres", genresRouter);
apiRouter.use("/books", booksRouter);
apiRouter.use("/reviews", reviewsRouter);

module.exports = apiRouter;
