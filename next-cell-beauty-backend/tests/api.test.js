import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/config/db.js";

describe("NEXT CELL BEAUTY API Test Suite", () => {
  let adminToken = "";

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("GET /healthz should return status ok", async () => {
    const res = await request(app).get("/healthz");
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual("ok");
  });

  test("POST /api/admin/auth/login with valid credentials should succeed", async () => {
    const res = await request(app)
      .post("/api/admin/auth/login")
      .send({ email: "admin@nextcall.com", password: "admin123" });

    expect(res.statusCode).toEqual(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.admin.email).toEqual("admin@nextcall.com");
    adminToken = res.body.accessToken;
  });

  test("POST /api/admin/auth/login with invalid credentials should return 401", async () => {
    const res = await request(app)
      .post("/api/admin/auth/login")
      .send({ email: "admin@nextcall.com", password: "wrongpassword" });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });

  test("GET /api/admin/products without token should return 401", async () => {
    const res = await request(app).get("/api/admin/products");
    expect(res.statusCode).toEqual(401);
  });

  test("GET /api/admin/products with valid admin token should return products", async () => {
    const res = await request(app)
      .get("/api/admin/products")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("GET /api/products should return public products list", async () => {
    const res = await request(app).get("/api/products");
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
  });
});
