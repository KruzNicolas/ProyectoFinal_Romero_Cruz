import { expect } from "chai";
import supertest from "supertest";

const request = supertest("http://localhost:8080");

const newUser = {
  firstName: "testFirstName",
  lastName: "testLastName",
  email: "testEmail@gmail.com",
  username: "testuser",
  password: "testpassword",
  age: 22,
  gender: "Male",
};

describe("Session Router", () => {
  describe("POST /api/sessions/register", () => {
    it("Should register a new user with a status code of 200", async () => {
      const response = await request
        .post("/api/sessions/register")
        .send(newUser);
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("status", "OK");
    });

    it("Should return an error if the email or username already exists", async () => {
      const response = await request
        .post("/api/sessions/register")
        .send(newUser);
      expect(response.status).to.equal(400);
      expect(response.body).to.have.property("status", "ERROR");
      expect(response.body).to.have.property("data", "Mail already register");
      // Add additional assertions as needed to validate error message
    });
  });

  describe("POST /api/sessions/login", () => {
    it("Should log in an existing user with a status code of 200", async () => {
      const existingUserCredentials = {
        username: "testuser",
        password: "testpassword",
      };
      const response = await request
        .post("/api/sessions/login")
        .send(existingUserCredentials);
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("Status", "OK");
    });

    it("Should return an error if username or password are incorrect", async () => {
      const invalidCredentials = {
        username: "invaliduser",
        password: "invalidpassword",
      };
      const response = await request
        .post("/api/sessions/login")
        .send(invalidCredentials);
      expect(response.status).to.equal(401);
      expect(response.body).to.have.property("status", "ERROR");
    });
  });
});
