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

describe('GET /companies', () => {
  test('Get a list with one company', async () => {
    const res = await request(app).get('/companies')
    expect(res.statusCode).toBe(200)
    expect(res.body.companies).toHaveLength(1)
    expect(res.body).toEqual({ companies: [company] })
  })
})

describe('GET /companies/:handle', () => {
  test('Get data on a single company by handle', async () => {
    const res = await request(app)
      .get(`/companies/${TEST_DATA.currentCompany.handle}`)
      .send({ _token: TEST_DATA.userToken })
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ company: company })
  })

  test('Attempt to get data on a company with invalid handle', async () => {
    const res = await request(app).get('/companies/supercompany')
    expect(res.statusCode).toBe(404)
    expect(res.body.message).toEqual(
      'There is no company with a handle of supercompany'
    )
  })
})

describe('POST /companies', () => {
  test('Add new company to the database', async () => {
    const newCompany = {
      handle: 'newcorp',
      name: 'New Corporation',
      num_employees: 23,
      description: 'The newest in new!',
      logo_url: 'https://via.placeholder.com/200',
    }

    const resp = await request(app)
      .post(`/companies`)
      .send({ newCompany, _token: TEST_DATA.userToken })
    expect(resp.statusCode).toBe(201)
    expect(resp.body.company).toHaveProperty('handle')
  })

  test('Attempt to add company with invalid data', async () => {
    const newCompany = {
      handle: 'newcorp',
      name: 'New Corporation',
      num_employees: '23',
      description: 'The newest in new!',
      logo_url: 'https://via.placeholder.com/200',
    }

    const res = await request(app)
      .post(`/companies`)
      .send({ newCompany, _token: TEST_DATA.userToken })

    expect(res.statusCode).toBe(400)
  })
})

describe('PATCH /companies/:handle', () => {
  test('Update a single company', async () => {
    company.name = 'The New Test Company'
    company.num_employees = 55

    const res = await request(app)
      .patch(`/companies/${TEST_DATA.currentCompany.handle}`)
      .send({
        name: 'newname',
        _token: TEST_DATA.userToken,
      })

    expect(response.body.company).toHaveProperty('handle')
    expect(response.body.company.name).toBe('newname')
    expect(response.body.company.handle).not.toBe(null)
  })
})

describe('DELETE /companies/:handle', () => {
  test('Delete a single company by handle', async () => {
    const res = await request(app)
      .delete(`/companies/${TEST_DATA.currentCompany.handle}`)
      .send({ _token: TEST_DATA.userToken })

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ message: 'Company deleted' })
  })

  test('Attempt to delete a company with invalid handle', async () => {
    const res = await request(app)
      .delete('/companies/supercorp')
      .send({ _token: TEST_DATA.userToken })

    expect(res.statusCode).toBe(404)
    expect(res.body.message).toEqual(
      'There is no company with a handle of supercorp'
    )
  })
})

afterEach(async () => {
  await afterEachHook()
})

afterAll(async () => {
  await afterAllHook()
})
