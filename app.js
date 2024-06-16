const express = require("express");
const apiRouter = require("./routes/api-router");

const { handleInvalidEndpoint } = require("./controllers/errors-controllers");

const app = express();

app.use(express.json());
app.use("/api", apiRouter);

app.all("/*", handleInvalidEndpoint);

module.exports = app;
