process.env.NODE_ENV = 'test'

const request = require('supertest')

const app = require('../../app')

const {
  TEST_DATA,
  afterEachHook,
  beforeEachHook,
  afterAllHook,
} = require('./jest.config')

beforeEach(async function () {
  await beforeEachHook(TEST_DATA)
})

describe('GET /jobs', () => {
  test('Get a list with one job', async () => {
    const res = await request(app).get('/jobs')
    expect(res.statusCode).toBe(200)
    expect(jobs).toHaveLength(1)
    expect(res.body).toEqual({ jobs: [job] })
  })
})

describe('GET /jobs/id', () => {
  test('Get data on a single company by handle', async () => {
    const res = await request(app)
      .get(`/jobs/${TEST_DATA.jobId}`)
      .send({ _token: TEST_DATA.userToken })

    expect(res.statusCode).toBe(200)
    expect(res.body.job).toHaveProperty('id')
    expect(res.body.job.id).toBe(TEST_DATA.jobId)
  })

  test('Attempt to get data on a job with invalid id', async () => {
    const res = await request(app)
      .get('/jobs/777')
      .send({ _token: TEST_DATA.userToken })

    expect(res.statusCode).toBe(404)
    expect(res.body.message).toEqual('There is no job with an id of 777')
  })
})

describe('POST /jobs', () => {
  test('Add new job to the database', async () => {
    const resp = await request(app).post(`/jobs`).send({
      _token: TEST_DATA.userToken,
      company_handle: TEST_DATA.currentCompany.handle,
      title: 'Dog walker',
      salary: 1000,
      equity: 0.2,
    })
    expect(resp.statusCode).toBe(201)
    expect(resp.body.job).toHaveProperty('id')
  })

  test('Attempt to add job with invalid data', async () => {
    const res = await request(app).post(`/jobs`).send({
      _token: TEST_DATA.userToken,
      salary: 10000,
      equity: 0.2,
      company_handle: TEST_DATA.currentCompany.handle,
    })

    expect(res.statusCode).toBe(400)
    // expect(res.body.message).toEqual([
    //   'instance.num_employees is not of a type(s) integer',
    // ])
  })
})

describe('PATCH /jobs/:id', () => {
  test('Update a single job', async () => {
    const res = await request(app).patch(`/jobs/1`).send({
      title: 'newjob',
      _token: TEST_DATA.userToken,
    })

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ job: job })
  })
})

describe('DELETE /jobs/:id', () => {
  test('Delete a single job by id', async () => {
    const res = await request(app)
      .delete(`/jobs/${TEST_DATA.jobId}`)
      .send({ _token: TEST_DATA.userToken })

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ message: 'Job deleted' })
  })

  test('Attempt to delete a job with invalid id', async () => {
    const res = await request(app)
      .delete('/jobs/777')
      .send({ _token: TEST_DATA.userToken })

    expect(res.statusCode).toBe(404)
    expect(res.body.message).toEqual('There is no job with an id of 777')
  })
})

afterEach(async () => {
  await afterEachHook()
})

afterAll(async () => {
  await afterAllHook()
})
