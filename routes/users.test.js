process.env.NODE_ENV = 'test'

const request = require('supertest')

const app = require('../app')
const db = require('../db')
const User = require('../models/user')

let user = {
  username: 'testuser',
  password: 'password',
  first_name: 'Gary',
  last_name: 'Johnson',
  email: 'testuser@example.com',
  photo_url: 'https://via.placeholder.com/200',
}

beforeEach(async function () {
  await User.register(user)
})

describe('GET /users', () => {
  test('Get a list with one user', async () => {
    const res = await request(app).get('/users')
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ users: [user] })
  })
})

describe('GET /users/username', () => {
  test('Get data on a single user by username', async () => {
    const res = await request(app).get(`/users/${user.id}`)
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ user: user })
  })

  test('Attempt to find a user with invalid username', async () => {
    const res = await request(app).get('/users/invalid-username')
    expect(res.statusCode).toBe(404)
    expect(res.body.message).toEqual(
      'There is no user with a username of invalid-username'
    )
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
