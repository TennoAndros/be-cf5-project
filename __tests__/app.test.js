const db = require("../db/connection");
const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");

const books = require("../db/data/test-data/books");

beforeEach(() => {
    return seed(data);
  });
  afterAll(() => db.end());

  describe("/api", () => {
    describe("GET", () => {
      describe("STATUS 200", () => {
        test("should respond with a json object listing all endpoints", () => {
          return request(app)
            .get("/api")
            .expect(200)
            .then(({ body }) => {
              expect(typeof body).toBe("object");
              expect(body).toEqual(
                expect.objectContaining({
                  "GET /api": expect.any(Object),
                  "GET /api/genres": expect.any(Object),
                  "POST /api/genres": expect.any(Object),
                  "GET /api/books": expect.any(Object),
                  "POST /api/books": expect.any(Object),
                  "GET /api/books/:book_id": expect.any(Object),
                  "PATCH /api/books/:book_id": expect.any(Object),
                  "DELETE /api/books/:book_id": expect.any(Object),
                  "GET /api/books/:book_id/reviews": expect.any(Object),
                  "POST /api/books/:book_id/reviews": expect.any(Object),
                  "GET /api/users": expect.any(Object),
                  "POST /api/users": expect.any(Object),
                  "GET /api/users/:username": expect.any(Object),
                  "PATCH /api/reviews/:review_id": expect.any(Object),
                  "DELETE /api/reviews/:review_id": expect.any(Object),
                })
              );
            });
        });
      });
    });
  });
  