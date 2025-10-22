import { API_BASE_URL } from "../../config/api";

// Mock fetch globally
global.fetch = jest.fn();

describe("API Utils", () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe("API_BASE_URL", () => {
    it("should be defined", () => {
      expect(API_BASE_URL).toBeDefined();
      expect(typeof API_BASE_URL).toBe("string");
    });

    it("should be a valid URL", () => {
      expect(() => new URL(API_BASE_URL)).not.toThrow();
    });
  });

  describe("API_ENDPOINTS", () => {
    it("should have all required endpoint categories", async () => {
      const { API_ENDPOINTS } = await import("../../config/api");

      expect(API_ENDPOINTS).toHaveProperty("AUTH");
      expect(API_ENDPOINTS).toHaveProperty("USERS");
      expect(API_ENDPOINTS).toHaveProperty("TOURNAMENTS");
      expect(API_ENDPOINTS).toHaveProperty("SQUADS");
      expect(API_ENDPOINTS).toHaveProperty("UPLOAD");
    });

    it("should have valid auth endpoints", async () => {
      const { API_ENDPOINTS } = await import("../../config/api");

      expect(API_ENDPOINTS.AUTH).toHaveProperty("LOGIN");
      expect(API_ENDPOINTS.AUTH).toHaveProperty("REGISTER");
      expect(API_ENDPOINTS.AUTH).toHaveProperty("ME");

      expect(API_ENDPOINTS.AUTH.LOGIN).toContain("/api/auth/login");
      expect(API_ENDPOINTS.AUTH.REGISTER).toContain("/api/auth/register");
      expect(API_ENDPOINTS.AUTH.ME).toContain("/api/auth/me");
    });

    it("should have valid tournament endpoints", async () => {
      const { API_ENDPOINTS } = await import("../../config/api");

      expect(API_ENDPOINTS.TOURNAMENTS).toHaveProperty("ALL");
      expect(API_ENDPOINTS.TOURNAMENTS).toHaveProperty("CREATE");

      expect(API_ENDPOINTS.TOURNAMENTS.ALL).toContain("/api/tournaments");
      expect(API_ENDPOINTS.TOURNAMENTS.CREATE).toContain("/api/tournaments");
    });
  });
});
