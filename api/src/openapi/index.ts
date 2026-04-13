import path from "path";
import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Tidarr API",
      description:
        "Tidarr REST API for managing Tidal music downloads, queue management, synchronization, and Lidarr integration.",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:8484",
        description: "Local Tidarr instance",
      },
    ],
    security: [
      { ApiKeyHeader: [] },
      { ApiKeyQuery: [] },
      { BearerToken: [] },
    ],
    components: {
      securitySchemes: {
        ApiKeyHeader: {
          type: "apiKey",
          in: "header",
          name: "X-Api-Key",
          description:
            "API key passed via X-Api-Key header (recommended for automation)",
        },
        ApiKeyQuery: {
          type: "apiKey",
          in: "query",
          name: "apikey",
          description: "API key passed via query parameter",
        },
        BearerToken: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token obtained from POST /api/auth",
        },
      },
    },
  },
  apis: [
    path.join(__dirname, "./schemas.{ts,js}"),
    path.join(__dirname, "../routes/*.{ts,js}"),
  ],
};

export const openapiSpec = swaggerJsdoc(options);
