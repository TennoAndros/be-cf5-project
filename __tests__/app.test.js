const db = require("../db/connection");
const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");

beforeEach(() => {
    return seed(data);
  });
  afterAll(() => db.end());

