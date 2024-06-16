const db = require("../db/connection");
const request = require("supertest");
const app = require("../app");
const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");

beforeEach(() => {
  return seed(data);
});
afterAll(() => db.end());

describe("/api/genres", () => {
  describe("GET", () => {
    describe("STATUS 200", () => {
      test("should respond with array of genre objects", async () => {
        const genreData = await request(app).get("/api/genres").expect(200);
        const {
          body: { genres },
        } = genreData;

        expect(genres).toEqual([
          { genre: "Mystery" },
          { genre: "Horror" },
          { genre: "Drama" },
        ]);
      });
    });
  });

  describe("STATUS ERROR 404 ", () => {
    test("should respond with error 404 when invalid endpoint is given", async () => {
      const genreData = await request(app).get("/api/grenes").expect(404);
      const {
        body: { msg },
      } = genreData;

      expect(msg).toEqual("Please enter a valid link. Go back and try again.");
    });
  });
});
