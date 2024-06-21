const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Book API Documentation",
      version: "1.0.0",
      description: "API documentation for the Book API CF5 final project",
    },
    servers: [
      { url: "http://localhost:9090", description: "Local server" },
      {
        url: "https://be-cf5-project.onrender.com/api-docs",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "Bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/*.js", "./documentation/*.yaml"],
};

const specs = swaggerJsdoc(options);

module.exports = { specs, swaggerUi };
