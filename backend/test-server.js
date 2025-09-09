const Fastify = require("fastify");

const fastify = Fastify({
  logger: true,
});

async function testUploadRoutes() {
  try {
    console.log("Testing upload routes registration...");

    // Import upload routes
    const uploadRoutes = require("./dist/routes/uploadRoutes.js");
    console.log("Upload routes imported:", !!uploadRoutes.default);

    // Register upload routes
    await fastify.register(uploadRoutes.default, { prefix: "/api/upload" });
    console.log("Upload routes registered successfully");

    // Start server
    await fastify.listen({ port: 3001, host: "0.0.0.0" });
    console.log("Test server running on port 3001");

    // Test the health endpoint
    const response = await fastify.inject({
      method: "GET",
      url: "/api/upload/health",
    });

    console.log(
      "Health endpoint response:",
      response.statusCode,
      response.body
    );
  } catch (error) {
    console.error("Error:", error);
  }
}

testUploadRoutes();
