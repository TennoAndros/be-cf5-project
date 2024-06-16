const apiRouter = require("express").Router();

const genresRouter = require("./genres-router");

const { getEndpoints } = require("../controllers/api-controllers");

apiRouter.get("/", getEndpoints);
apiRouter.use("/genres", genresRouter);

module.exports = apiRouter;
