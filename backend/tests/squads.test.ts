import request from "supertest";
import { FastifyInstance } from "fastify";
import { buildApp } from "../src/index";

describe("Squad Routes", () => {
  let app: FastifyInstance;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    // Register and login a user for authenticated requests
    const userData = {
      name: "Squad Test User",
      email: "squadtest@example.com",
      password: "password123",
      role: "PLAYER",
    };

    await request(app.server).post("/api/auth/register").send(userData);

    const loginResponse = await request(app.server)
      .post("/api/auth/login")
      .send({
        email: "squadtest@example.com",
        password: "password123",
      });

    authToken = loginResponse.body.data.token;
    userId = loginResponse.body.data.user._id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /api/squads", () => {
    it("should create a new squad", async () => {
      const squadData = {
        name: "Test Squad",
        tag: "TEST",
        description: "A test squad",
        game: "Counter-Strike 2",
        maxMembers: 7,
        isRecruiting: true,
      };

      const response = await request(app.server)
        .post("/api/squads")
        .set("Authorization", `Bearer ${authToken}`)
        .send(squadData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.squad.name).toBe(squadData.name);
      expect(response.body.squad.leader).toBe(userId);
    });

    it("should not create squad without authentication", async () => {
      const squadData = {
        name: "Unauthorized Squad",
        tag: "UNAUTH",
        description: "This should fail",
        game: "Counter-Strike 2",
        maxMembers: 7,
        isRecruiting: true,
      };

      const response = await request(app.server)
        .post("/api/squads")
        .send(squadData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/squads", () => {
    it("should get all squads", async () => {
      const response = await request(app.server).get("/api/squads").expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.squads)).toBe(true);
    });

    it("should filter squads by game", async () => {
      const response = await request(app.server)
        .get("/api/squads?game=Counter-Strike 2")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.squads)).toBe(true);
    });
  });

  describe("GET /api/squads/:id", () => {
    let squadId: string;

    beforeEach(async () => {
      // Create a squad for testing
      const squadData = {
        name: "Get Test Squad",
        tag: "GETTEST",
        description: "A squad for testing GET",
        game: "Counter-Strike 2",
        maxMembers: 7,
        isRecruiting: true,
      };

      const createResponse = await request(app.server)
        .post("/api/squads")
        .set("Authorization", `Bearer ${authToken}`)
        .send(squadData);

      squadId = createResponse.body.squad._id;
    });

    it("should get a specific squad", async () => {
      const response = await request(app.server)
        .get(`/api/squads/${squadId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.squad._id).toBe(squadId);
    });

    it("should return 404 for non-existent squad", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const response = await request(app.server)
        .get(`/api/squads/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
