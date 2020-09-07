process.env.NODE_ENV = 'test'

const request = require('supertest')

const app = require('../app')
const db = require('../db')

let job = {
  title: 'Senior Manager',
  salary: 80000,
  equity: 0.5,
  company_handle: 'testcorp',
}
let company = {
  handle: 'testcorp',
  name: 'Test Corporation',
  num_employees: 50,
  description: 'Corporation dedicated to testing',
  logo_url:
    'https://images.unsplash.com/photo-1556761175-4b46a572b786?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=967&q=80',
}

beforeEach(async function () {
  await db.query(
    `INSERT INTO companies
      (handle, name, num_employees, description, logo_url)
      VALUES ($1, $2, $3, $4, $5)`,
    [
      company.handle,
      company.name,
      company.num_employees,
      company.description,
      company.logo_url,
    ]
  )
  await db.query(
    `INSERT INTO jobs
      (title, salary, equity, company_handle)
      VALUES ($1, $2, $3, $4)`,
    [job.title, job.salary, job.equity, job.company_handle]
  )
})

describe('GET /jobs', () => {
  test('Get a list with one job', async () => {
    const res = await request(app).get('/jobs')
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ jobs: [job] })
  })
})

describe('GET /jobs/id', () => {
  test('Get data on a single company by handle', async () => {
    const res = await request(app).get(`/jobs/${job.id}`)
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ job: job })
  })

  test('Attempt to get data on a job with invalid id', async () => {
    const res = await request(app).get('/jobs/999')
    expect(res.statusCode).toBe(404)
    expect(res.body.message).toEqual('There is no job with an id of 999')
  })
})

describe('POST /jobs', () => {
  test('Add new job to the database', async () => {
    const newJob = {
      title: 'newjob',
      salary: 50000,
      equity: 0.1,
      company_handle: 'testcorp',
    }

    const resp = await request(app).post(`/jobs`).send(newJob)
    expect(resp.statusCode).toBe(201)
    expect(resp.body).toEqual({
      job: newJob,
    })
  })

  test('Attempt to add job with invalid data', async () => {
    const newJob = {
      title: 33,
      salary: '50000',
      equity: 0.1,
      company_handle: 'testcorp',
    }

    const res = await request(app).post(`/jobs`).send(newJob)

    expect(res.statusCode).toBe(400)
    // expect(res.body.message).toEqual([
    //   'instance.num_employees is not of a type(s) integer',
    // ])
  })
})

describe('PATCH /jobs/:id', () => {
  test('Update a single job', async () => {
    job.title = 'Senior Managing Partner'

    const res = await request(app).patch(`/jobs/1`).send(job)

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ job: job })
  })
})

describe('DELETE /jobs/:id', () => {
  test('Delete a single job by id', async () => {
    const res = await request(app).delete(`/jobs/${job.id}`)

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ message: 'Job deleted' })
  })

  test('Attempt to delete a job with invalid id', async () => {
    const res = await request(app).delete('/jobs/999')

    expect(res.statusCode).toBe(404)
    expect(res.body.message).toEqual('There is no job with an id of 999')
  })
})

afterEach(async () => {
  await db.query('DELETE FROM jobs')
  await db.query('DELETE FROM companies')
})

afterAll(async () => {
  await db.end()
})
