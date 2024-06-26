const {
  convertTimestampToDate,
  createRef,
  formatReviews,
  hashPassword,
  generateToken,
} = require("../utils/utils");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET;

describe("convertTimestampToDate", () => {
  test("returns a new object", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    const result = convertTimestampToDate(input);
    expect(result).not.toBe(input);
    expect(result).toBeObject();
  });
  test("converts a created_at property to a date", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    const result = convertTimestampToDate(input);
    expect(result.created_at).toBeDate();
    expect(result.created_at).toEqual(new Date(timestamp));
  });
  test("does not mutate the input", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    convertTimestampToDate(input);
    const control = { created_at: timestamp };
    expect(input).toEqual(control);
  });
  test("ignores includes any other key-value-pairs in returned object", () => {
    const input = { created_at: 0, key1: true, key2: 1 };
    const result = convertTimestampToDate(input);
    expect(result.key1).toBe(true);
    expect(result.key2).toBe(1);
  });
  test("returns unchanged object if no created_at property", () => {
    const input = { key: "value" };
    const result = convertTimestampToDate(input);
    const expected = { key: "value" };
    expect(result).toEqual(expected);
  });
});

describe("createRef", () => {
  test("returns an empty object, when passed an empty array", () => {
    const input = [];
    const actual = createRef(input);
    const expected = {};
    expect(actual).toEqual(expected);
  });
  test("returns a reference object when passed an array with a single items", () => {
    const input = [{ title: "title1", book_id: 1, username: "name1" }];
    let actual = createRef(input, "title", "book_id");
    let expected = { title1: 1 };
    expect(actual).toEqual(expected);
    actual = createRef(input, "username", "title");
    expected = { name1: "title1" };
    expect(actual).toEqual(expected);
  });
  test("returns a reference object when passed an array with many items", () => {
    const input = [
      { title: "title1", book_id: 1 },
      { title: "title2", book_id: 2 },
      { title: "title3", book_id: 3 },
    ];
    const actual = createRef(input, "title", "book_id");
    const expected = { title1: 1, title2: 2, title3: 3 };
    expect(actual).toEqual(expected);
  });
  test("does not mutate the input", () => {
    const input = [{ title: "title1", book_id: 1 }];
    const control = [{ title: "title1", book_id: 1 }];
    createRef(input);
    expect(input).toEqual(control);
  });
});

describe("formatReviews", () => {
  test("returns an empty array, if passed an empty array", () => {
    const reviews = [];
    expect(formatReviews(reviews, {})).toEqual([]);
    expect(formatReviews(reviews, {})).not.toBe(reviews);
  });
  test("converts created_by key to username", () => {
    const reviews = [{ created_by: "ant" }, { created_by: "bee" }];
    const formattedReviews = formatReviews(reviews, {});
    expect(formattedReviews[0].username).toEqual("ant");
    expect(formattedReviews[0].created_by).toBe(undefined);
    expect(formattedReviews[1].username).toEqual("bee");
    expect(formattedReviews[1].created_by).toBe(undefined);
  });
  test("replaces belongs_to value with appropriate id when passed a reference object", () => {
    const reviews = [{ belongs_to: "title1" }, { belongs_to: "title2" }];
    const ref = { title1: 1, title2: 2 };
    const formattedReviews = formatReviews(reviews, ref);
    expect(formattedReviews[0].book_id).toBe(1);
    expect(formattedReviews[1].book_id).toBe(2);
  });
  test("converts created_at timestamp to a date", () => {
    const timestamp = Date.now();
    const reviews = [{ created_at: timestamp }];
    const formattedReviews = formatReviews(reviews, {});
    expect(formattedReviews[0].created_at).toEqual(new Date(timestamp));
  });
});

describe("hashPassword", () => {
  test("hashes a password correctly", async () => {
    const password = "password123";
    const hashedPassword = await hashPassword(password);
    expect(hashedPassword).toBeString();
    const match = await bcrypt.compare(password, hashedPassword);
    expect(match).toBe(true);
  });
  test("returns different hashes for the same password", async () => {
    const password = "password123";
    const hashedPassword1 = await hashPassword(password);
    const hashedPassword2 = await hashPassword(password);
    expect(hashedPassword1).not.toEqual(hashedPassword2);
  });
  test("consistent hash length", async () => {
    const password = "password123";
    const hashedPassword = await hashPassword(password);
    expect(hashedPassword.length).toBeGreaterThan(0);
    const length = hashedPassword.length;
    const passwords = ["short", "longpasswordwithmanycharacters", "1234567890"];
    for (const pw of passwords) {
      const hash = await hashPassword(pw);
      expect(hash.length).toEqual(length);
    }
  });
  test("throws error on hashing failure", async () => {
    const originalBcryptHash = bcrypt.hash;
    bcrypt.hash = jest.fn().mockImplementation(() => {
      throw new Error("Hashing failed");
    });
    await expect(hashPassword("password123")).rejects.toThrow(
      "Error hashing password"
    );
    bcrypt.hash = originalBcryptHash;
  });
  test("throws error on invalid salt rounds", async () => {
    const originalBcryptHash = bcrypt.hash;
    bcrypt.hash = jest.fn().mockImplementation(() => {
      throw new Error("Invalid salt rounds");
    });
    await expect(hashPassword("password123")).rejects.toThrow(
      "Error hashing password"
    );
    bcrypt.hash = originalBcryptHash;
  });
});

describe("generateToken", () => {
  test("should generate a token as a string", () => {
    const user = { userId: 1, username: "testuser" };
    const token = generateToken(user);

    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
  });
  test("should generate different tokens for different inputs", () => {
    const user1 = { userId: 1, username: "user1" };
    const user2 = { userId: 2, username: "user2" };

    const token1 = generateToken(user1);
    const token2 = generateToken(user2);

    expect(token1).not.toEqual(token2);
  });
  test("should decode and verify token", () => {
    const user = { userId: 1, username: "testuser" };
    const token = generateToken(user);

    const decoded = jwt.verify(token, SECRET_KEY);

    expect(decoded.userId).toBe(user.userId);
    expect(decoded.username).toBe(user.username);
  });
  test("should expire token after 1 hour", () => {
    const user = { userId: 1, username: "testuser" };
    const token = generateToken(user);

    const oneHourPlusOneSecond = Math.floor(Date.now() / 1000) + 3601;

    const decoded = jwt.verify(token, SECRET_KEY);
    expect(decoded.exp).toBeLessThanOrEqual(oneHourPlusOneSecond);
  });
});
