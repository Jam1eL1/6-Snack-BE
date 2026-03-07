import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Snack API",
    version: "1.0.0",
    description: "Welcome to the Snack API documentation, a one-stop office procurement solution.",
  },
  servers: [
    {
      url: "http://localhost:8080",
      description: "Development server",
    },
    {
      url: "https://api.5nack.site",
      description: "Production server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
