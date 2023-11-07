require("dotenv").config({ path: ".env.test" });
const app = require("../../app");
const request = require("supertest");
const { connectMongo, disconnectMongo } = require("../../services/mongo");

describe("Launches routes", () => {
  beforeAll(async () => {
    await connectMongo();
  });

  afterAll(async () => {
    await disconnectMongo();
  });

  describe("Test GET /v1/launches", () => {
    test("It should respond with 200 success", async () => {
      const response = await request(app)
        .get("/v1/launches")
        .expect(200)
        .expect("Content-Type", /json/);
    });
    test("It should have content type of json", async () => {
      await request(app).get("/v1/launches").expect("Content-Type", /json/);
    });
  });

  describe("Test POST /v1/launches", () => {
    const completeLaunchData = {
      mission: "Exo Exploration01",
      rocket: "Dino IS1",
      target: "Kepler-296 A f",
      launchDate: "2024-01-01",
    };

    const dateErrorLaunchData = {
      mission: "Exo Exploration01",
      rocket: "Dino IS1",
      target: "Kepler-296 A f",
      launchDate: "zoot",
    };

    const launchDataWithoutDate = {
      mission: "Exo Exploration01",
      rocket: "Dino IS1",
      target: "Kepler-296 A f",
    };
    const launchDate = new Date(completeLaunchData.launchDate).valueOf();

    test("It should response with 201 created", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchData)
        .expect(201);

      const respLaunchDate = new Date(response.body.launchDate).valueOf();

      expect(respLaunchDate).toBe(launchDate);
      expect(response.body).toMatchObject(launchDataWithoutDate);
    });

    test("It should catch missing required properties", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithoutDate)
        .expect(400)
        .expect("Content-Type", /json/);

      expect(response.body).toStrictEqual({
        error: "Missing required launch property",
        ok: false,
      });
    });
    test("It should catch invalid dates", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(dateErrorLaunchData)
        .expect(400)
        .expect("Content-Type", /json/);

      expect(response.body).toStrictEqual({
        error: "Invalid launch date",
        ok: false,
      });
    });
  });
});
