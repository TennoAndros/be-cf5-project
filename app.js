const express = require("express");
const apiRouter = require("./routes/api-router");
const { specs, swaggerUi } = require("./utils/swagger");
const { SwaggerTheme, SwaggerThemeNameEnum } = require("swagger-themes");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const {
  handleInvalidEndpoint,
  handleCustomErrors,
  handlePsqlErrors,
} = require("./controllers/errors-controllers");

const app = express();

app.use(cookieParser());
app.use(cors());

app.use(express.json());
app.use("/api", apiRouter);

const theme = new SwaggerTheme();

const options = {
  explorer: true,
  customCss: theme.getBuffer(SwaggerThemeNameEnum.DARK_MONOKAI),
};

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, options));

app.all("/*", handleInvalidEndpoint);

app.use(handleCustomErrors);
app.use(handlePsqlErrors);

module.exports = app;
