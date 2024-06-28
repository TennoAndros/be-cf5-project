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

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:9090",
  "https://be-cf5-project.onrender.com",
];

app.use(cookieParser());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

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
