const db = require("../db/connection");
const request = require("supertest");
const app = require("../app");
const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");

beforeEach(() => {
  return seed(data);
});
afterAll(() => db.end());

describe("/api", () => {
  describe("GET", () => {
    describe("STATUS 2--", () => {
      test("should respond with a json object listing all endpoints", async () => {
        const apiData = await request(app).get("/api").expect(200);
        const { body } = apiData;

        expect(typeof body).toBe("object");
        expect(body).toEqual(
          expect.objectContaining({
            "GET /api": expect.any(Object),
            "GET /api/genres": expect.any(Object),
            "GET /api/books": expect.any(Object),
            "GET /api/books/:book_id": expect.any(Object),
            "GET /api/books/:book_id/reviews": expect.any(Object),
          })
        );
      });
    });
  });
});

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

describe("/api/books", () => {
  describe("GET", () => {
    describe("STATUS 200", () => {
      test("should respond with array book objects", async () => {
        const bookData = await request(app).get("/api/books").expect(200);
        const {
          body: { books },
        } = bookData;

        books.forEach((book) => {
          expect(book).toEqual(
            expect.objectContaining({
              amazon_book_url: expect.any(String),
              author: expect.any(String),
              book_id: expect.any(Number),
              description: expect.any(String),
              genre: expect.any(String),
              image_url: expect.any(String),
              isbn: expect.any(String),
              publisher: expect.any(String),
              rating: expect.any(Number),
              title: expect.any(String),
            })
          );
        });
      });
    });
  });
});

describe("/api/books/:book_id", () => {
  describe("GET", () => {
    describe("STATUS 200", () => {
      test("should return a book object based on the id", async () => {
        const bookData = await request(app).get("/api/books/1").expect(200);
        const {
          body: { book },
        } = bookData;

        expect(book).toEqual({
          title: "CAMINO GHOSTS",
          image_url:
            "https://storage.googleapis.com/du-prd/books/images/9780385545990.jpg",
          description:
            "The third book in the Camino series. The last living inhabitant of a deserted island gets in the way of a resort developer.",
          author: "John Grisham",
          book_id: 1,
          publisher: "Doubleday",
          amazon_book_url:
            "https://www.amazon.com/dp/0385545991?tag=thenewyorktim-20",
          isbn: "0385545991",
          genre: "Mystery/Thriller",
          rating: 0.0,
          review_count: 1,
        });
      });
    });

    describe("STATUS ERROR 404", () => {
      test("should respond with error 404 when valid book_id is given but book doesn't exist", async () => {
        const response = await request(app).get("/api/books/500").expect(404);
        const {
          body: { msg },
        } = response;

        expect(msg).toEqual("Book Not Found!");
      });
    });

    describe("STATUS ERROR 400", () => {
      test("should respond with error 404 when invalid book_id 'not a number' is given", async () => {
        const response = await request(app).get("/api/books/das").expect(400);
        const {
          body: { msg },
        } = response;

        expect(msg).toEqual("Bad Request!");
      });
    });
  });
});

describe("/api/books/:book_id/reviews", () => {
  describe("GET", () => {
    describe("STATUS 200", () => {
      test("should return a review array base on book_id", async () => {
        const bookReviewData = await request(app).get("/api/books/3/reviews");
        const {
          body: { reviews },
        } = bookReviewData;

        expect(reviews).toHaveLength(10);
        reviews.forEach((review) => {
          expect(review).toEqual(
            expect.objectContaining({
              body: expect.any(String),
              username: expect.any(String),
              created_at: expect.any(String),
              rating: expect.any(Number),
              review_id: expect.any(Number),
              book_id: expect.any(Number),
            })
          );
        });
        expect(reviews).toBeSortedBy("created_at", { descending: true });
      });

      test("should respond with a maximum of 10 reviews for the specified book, which is the default value", async () => {
        const reviewData = await request(app)
          .get("/api/books/3/reviews")
          .expect(200);
        const {
          body: { reviews },
        } = reviewData;

        expect(reviews).toHaveLength(10);
      });

      test("should respond with reviews of specified book with provided limit", async () => {
        const reviewData = await request(app)
          .get("/api/books/3/reviews?limit=3")
          .expect(200);
        const {
          body: { reviews },
        } = reviewData;

        expect(reviews).toHaveLength(3);
      });

      test("should respond with all reviews of specified book if limit is 0", async () => {
        const reviewData = await request(app)
          .get("/api/books/3/reviews?limit=0")
          .expect(200);
        const {
          body: { reviews },
        } = reviewData;

        expect(reviews).toHaveLength(11);
      });

      test("should respond with the number of pages given", async () => {
        const reviewData = await request(app)
          .get("/api/books/3/reviews?p=1")
          .expect(200);
        const {
          body: { reviews },
        } = reviewData;

        expect(reviews).toHaveLength(10);
      });

      test("should contain a total count property", async () => {
        const reviewData = await request(app)
          .get("/api/books/3/reviews")
          .expect(200);
        const {
          body: { total_count },
        } = reviewData;

        expect(total_count).toBe(11);
      });
    });
  });

  describe("STATUS ERROR 400", () => {
    test("should respond with error 400 when invalid book_id 'not a number' is given", async () => {
      const response = await request(app)
        .get("/api/books/das/reviews")
        .expect(400);
      const {
        body: { msg },
      } = response;

      expect(msg).toEqual("Bad Request!");
    });

    test("should respond with error 404 when invalid endpoint is given", async () => {
      const response = await request(app)
        .get("/api/books/3/notvalidendpoint")
        .expect(404);
      const {
        body: { msg },
      } = response;

      expect(msg).toEqual("Please enter a valid link. Go back and try again.");
    });

    test("should respond with error 400 if limit query isn't a number", async () => {
      const response = await request(app)
        .get("/api/books/3/reviews?limit=notNumber")
        .expect(400);
      const {
        body: { msg },
      } = response;

      expect(msg).toEqual(
        "Please enter a valid limit. Limit should be a number!"
      );
    });

    test("should respond with error 400 if p query isn't a number", async () => {
      const response = await request(app)
        .get("/api/books/3/reviews?p=notNumber")
        .expect(400);
      const {
        body: { msg },
      } = response;

      expect(msg).toEqual("Please enter a valid p. P should be a number!");
    });

    test("should respond with limit and p queries must be positive integers if given negative integers", async () => {
      const response = await request(app)
        .get("/api/books/3/reviews?limit=-5")
        .expect(400);
      const {
        body: { msg },
      } = response;

      expect(msg).toEqual("Limit and p must be positive numbers!");
    });

    test("should respond with error 404 when valid book_id is given but book doesn't exist in database", async () => {
      const response = await request(app)
        .get("/api/books/500/reviews")
        .expect(404);
      const {
        body: { msg },
      } = response;

      expect(msg).toEqual("Book Not Found!");
    });

    test("should respond with error 404 if limit or p query number exceeds the total number of reviews in our database for the specified book", async () => {
      const response = await request(app)
        .get("/api/books/3/reviews?p=45")
        .expect(404);
      const {
        body: { msg },
      } = response;

      expect(msg).toEqual(
        "Please provide valid values.Limit or p cannot be greater than the total number of reviews for specified book!"
      );
    });
  });
});
