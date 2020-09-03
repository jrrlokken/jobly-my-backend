process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");

let company = {};

beforeEach(async function () {
  company.handle = "testco";
  company.name = "Test Company";
  company.num_employees = 2;
  company.description = "Test company extraordinaire";
  company.logo_url = "https://via.placeholder.com/200";

  await db.query(
    `INSERT INTO companies
      (handle, name, num_employees, description, logo_url)
      VALUES ($1, $2, $3, $4, $5)`,
    [company.handle, company.name, company.num_employees, company.description, company.logo_url]
  );
})

describe("GET /companies", () => {
  test("Get a list with one company", async () => {
    const res = await request(app).get('/companies')
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      { "companies": [company] }
    )
  });
});

describe("GET /companies/handle", () => {
  test("Get data on a single company by handle", async () => {
    const res = await request(app).get(`/companies/${company.handle}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ "company": company });
  });

  test("Attempt to get data on a company with invalid handle", async () => {
    const res = await request(app).get("/companies/supercompany");
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toEqual("There is no company with a handle of supercompany");
  });
});

describe("POST /companies", () => {
  test("Add new company to the database", async () => {
    const newCompany = {
      handle: "newcorp",
      name: "New Corporation",
      num_employees: 23,
      description: "The newest in new!",
      logo_url: "https://via.placeholder.com/200"
    }

    const resp = await request(app)
      .post(`/companies`)
      .send(newCompany);
    expect(resp.statusCode).toBe(201);
    expect(resp.body).toEqual({
      "company": newCompany
    });
  });

  test("Attempt to add company with invalid data", async () => {
    const newCompany = {
      handle: "newcorp",
      name: "New Corporation",
      num_employees: "23",
      description: "The newest in new!",
      logo_url: "https://via.placeholder.com/200"
    }

    const res = await request(app)
      .post(`/companies`)
      .send(newCompany);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toEqual(["instance.num_employees is not of a type(s) integer"]);
  });
});

describe("PATCH /companies/:handle", () => {
  test("Update a single company", async () => {
    company.name = "The New Test Company";
    company.num_employees = 55;

    const res = await request(app)
      .patch(`/companies/testco`)
      .send(company);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ "company": company });
  })
})


describe("DELETE /companies/:handle", () => {
  test("Delete a single company by handle", async () => {
    const res = await request(app).delete(`/companies/${company.handle}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Company deleted" });
  });

  test("Attempt to delete a company with invalid handle", async () => {
    const res = await request(app).delete("/companies/supercorp");

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toEqual("There is no company with a handle of supercorp");
  });
});


afterEach(async () => {
  await db.query("DELETE FROM companies");
});

afterAll(async () => {
  await db.end();
});