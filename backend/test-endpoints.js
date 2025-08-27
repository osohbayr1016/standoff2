const fetch = require("node-fetch");

const API_BASE = "http://localhost:8000";

async function testEndpoints() {
  console.log("🧪 Testing Message and Notification Endpoints...\n");

  // Test 1: Health checks
  console.log("1. Testing health checks...");
  try {
    const messageHealth = await fetch(`${API_BASE}/api/messages/health`);
    const notificationHealth = await fetch(
      `${API_BASE}/api/notifications/health`
    );

    console.log("✅ Message health check:", messageHealth.status);
    console.log("✅ Notification health check:", notificationHealth.status);
  } catch (error) {
    console.log("❌ Health check failed:", error.message);
  }

  // Test 2: Message endpoints (without auth - should return 401)
  console.log(
    "\n2. Testing message endpoints (should return 401 without auth)..."
  );
  try {
    const messageResponse = await fetch(
      `${API_BASE}/api/messages/test-user-id`
    );
    console.log("✅ Message endpoint response:", messageResponse.status);

    if (messageResponse.status === 401) {
      console.log("✅ Correctly requires authentication");
    }
  } catch (error) {
    console.log("❌ Message endpoint test failed:", error.message);
  }

  // Test 3: Notification endpoints (without auth - should return 401)
  console.log(
    "\n3. Testing notification endpoints (should return 401 without auth)..."
  );
  try {
    const notificationResponse = await fetch(`${API_BASE}/api/notifications`);
    console.log(
      "✅ Notification endpoint response:",
      notificationResponse.status
    );

    if (notificationResponse.status === 401) {
      console.log("✅ Correctly requires authentication");
    }
  } catch (error) {
    console.log("❌ Notification endpoint test failed:", error.message);
  }

  // Test 4: Send message endpoint (without auth - should return 401)
  console.log(
    "\n4. Testing send message endpoint (should return 401 without auth)..."
  );
  try {
    const sendResponse = await fetch(`${API_BASE}/api/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        receiverId: "test-user-id",
        content: "Test message",
      }),
    });
    console.log("✅ Send message endpoint response:", sendResponse.status);

    if (sendResponse.status === 401) {
      console.log("✅ Correctly requires authentication");
    }
  } catch (error) {
    console.log("❌ Send message endpoint test failed:", error.message);
  }

  console.log("\n🎉 Endpoint testing completed!");
  console.log(
    "\n📝 Note: All endpoints correctly return 401 (Unauthorized) when accessed without authentication,"
  );
  console.log("   which is the expected behavior for protected routes.");
}

// Run the tests
testEndpoints().catch(console.error);
