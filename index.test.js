const request = require("supertest");
const app = require("./app");

describe("Test the root path", () => {
  test("It should response the GET method", done => {
    request(app)
      .get("/")
      .then(response => {
        expect(response.statusCode).toBe(200);
        done();
      });
  });
});

describe("Test the json path", () => {
    test("It should response the GET method", done => {
      request(app)
        .get("/json")
        .then(response => {
          expect(response.statusCode).toBe(200);
          done();
        });
    });
  });