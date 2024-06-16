const apiRouter = require("express").Router();

const genresRouter = require("./genres-router");
const booksRouter = require("./books-router");

const { getEndpoints } = require("../controllers/api-controllers");

apiRouter.get("/", getEndpoints);
apiRouter.use("/genres", genresRouter);
apiRouter.use("/books", booksRouter);

module.exports = apiRouter;
