import request from "supertest";
import { FastifyInstance } from "fastify";
import { buildApp } from "../src/index";

describe("Auth Routes", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        role: "PLAYER",
      };

      const response = await request(app.server)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.token).toBeDefined();
    });

    it("should not register user with duplicate email", async () => {
      const userData = {
        name: "Test User 2",
        email: "test@example.com", // Same email as previous test
        password: "password123",
        role: "PLAYER",
      };

      const response = await request(app.server)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("already exists");
    });

    it("should validate required fields", async () => {
      const userData = {
        name: "Test User",
        // Missing email and password
        role: "PLAYER",
      };

      const response = await request(app.server)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Register a user for login tests
      const userData = {
        name: "Login Test User",
        email: "logintest@example.com",
        password: "password123",
        role: "PLAYER",
      };

      await request(app.server).post("/api/auth/register").send(userData);
    });

    it("should login with valid credentials", async () => {
      const loginData = {
        email: "logintest@example.com",
        password: "password123",
      };

      const response = await request(app.server)
        .post("/api/auth/login")
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.token).toBeDefined();
    });

    it("should not login with invalid credentials", async () => {
      const loginData = {
        email: "logintest@example.com",
        password: "wrongpassword",
      };

      const response = await request(app.server)
        .post("/api/auth/login")
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/auth/me", () => {
    let authToken: string;

    beforeEach(async () => {
      // Register and login a user
      const userData = {
        name: "Me Test User",
        email: "metest@example.com",
        password: "password123",
        role: "PLAYER",
      };

      await request(app.server).post("/api/auth/register").send(userData);

      const loginResponse = await request(app.server)
        .post("/api/auth/login")
        .send({
          email: "metest@example.com",
          password: "password123",
        });

      authToken = loginResponse.body.data.token;
    });

    it("should get user profile with valid token", async () => {
      const response = await request(app.server)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe("metest@example.com");
    });

    it("should not get user profile without token", async () => {
      const response = await request(app.server)
        .get("/api/auth/me")
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
