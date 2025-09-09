import request from "supertest";
import { FastifyInstance } from "fastify";
import { buildApp } from "../src/index";

describe("Tournament Routes", () => {
  let app: FastifyInstance;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    // Register and login a user for authenticated requests
    const userData = {
      name: "Tournament Test User",
      email: "tournamenttest@example.com",
      password: "password123",
      role: "ORGANIZATION",
    };

    await request(app.server).post("/api/auth/register").send(userData);

    const loginResponse = await request(app.server)
      .post("/api/auth/login")
      .send({
        email: "tournamenttest@example.com",
        password: "password123",
      });

    authToken = loginResponse.body.data.token;
    userId = loginResponse.body.data.user._id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /api/tournaments", () => {
    it("should create a new tournament", async () => {
      const tournamentData = {
        name: "Test Tournament",
        game: "Counter-Strike 2",
        description: "A test tournament",
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        registrationDeadline: new Date(
          Date.now() + 5 * 24 * 60 * 60 * 1000
        ).toISOString(), // 5 days from now
        prizePool: 10000,
        currency: "MNT",
        maxSquads: 16,
        format: "Single Elimination",
        entryFee: 5000,
        tournamentType: "tax",
        location: "Online",
      };

      const response = await request(app.server)
        .post("/api/tournaments")
        .set("Authorization", `Bearer ${authToken}`)
        .send(tournamentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.tournament.name).toBe(tournamentData.name);
      expect(response.body.tournament.organizer).toBe(userId);
    });

    it("should not create tournament without authentication", async () => {
      const tournamentData = {
        name: "Unauthorized Tournament",
        game: "Counter-Strike 2",
        description: "This should fail",
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        registrationDeadline: new Date(
          Date.now() + 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
        prizePool: 10000,
        currency: "MNT",
        maxSquads: 16,
        format: "Single Elimination",
        entryFee: 5000,
        tournamentType: "tax",
        location: "Online",
      };

      const response = await request(app.server)
        .post("/api/tournaments")
        .send(tournamentData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/tournaments", () => {
    it("should get all tournaments", async () => {
      const response = await request(app.server)
        .get("/api/tournaments")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.tournaments)).toBe(true);
    });

    it("should filter tournaments by status", async () => {
      const response = await request(app.server)
        .get("/api/tournaments?status=upcoming")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.tournaments)).toBe(true);
    });
  });

  describe("GET /api/tournaments/:id", () => {
    let tournamentId: string;

    beforeEach(async () => {
      // Create a tournament for testing
      const tournamentData = {
        name: "Get Test Tournament",
        game: "Counter-Strike 2",
        description: "A tournament for testing GET",
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        registrationDeadline: new Date(
          Date.now() + 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
        prizePool: 10000,
        currency: "MNT",
        maxSquads: 16,
        format: "Single Elimination",
        entryFee: 5000,
        tournamentType: "tax",
        location: "Online",
      };

      const createResponse = await request(app.server)
        .post("/api/tournaments")
        .set("Authorization", `Bearer ${authToken}`)
        .send(tournamentData);

      tournamentId = createResponse.body.tournament._id;
    });

    it("should get a specific tournament", async () => {
      const response = await request(app.server)
        .get(`/api/tournaments/${tournamentId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.tournament._id).toBe(tournamentId);
    });

    it("should return 404 for non-existent tournament", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const response = await request(app.server)
        .get(`/api/tournaments/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
