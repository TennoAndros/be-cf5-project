const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Book API Documentation",
      version: "1.0.0",
      description: "API documentation for the Book API CF5 final project",
    },
    servers: [
      { url: "http://localhost:9090", description: "Local server" },
      {
        url: "https://be-cf5-project.onrender.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "access_token",
          description: "Authentication cookie containing JWT token.",
        },
      },
    },
    security: [
      {
        cookieAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js", "./documentation/*.yaml"],
};

const specs = swaggerJsdoc(options);

module.exports = { specs, swaggerUi };