const request = require("supertest");
const tagsService = require("../../services/tags_service");
const app = require("../../appForTests");

const mockedTags = ["React"];

jest.mock("../../services/tags_service");
jest.mock("../../middleware/authorization", () => {
  const actual = jest.requireActual("../../middleware/authorization");
  return {
    ...actual,
    verifyRoles: jest.fn(() => (req, res, next) => next()),
  };
});

describe("GET /tags", () => {
  it("Return all tags success", async () => {
    tagsService.getAllTags.mockResolvedValue(mockedTags);
    const res = await request(app).get("/tags");
    expect(res.statusCode).toBe(200);
    expect(res.body.tags.length).toBeGreaterThan(0);
    expect(Array.isArray(res.body.tags)).toBe(true);
    res.body.tags.forEach((tag) => expect(typeof tag).toBe("string"));
  });

  it("Unexpected error during tags retrieval", async () => {
    tagsService.getAllTags.mockRejectedValue(new Error("Database error"));
    const res = await request(app).get("/tags");
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});
