process.env.NODE_ENV = 'test'
const request = require('supertest')

// app imports
const app = require('../../app')

const {
  TEST_DATA,
  afterEachHook,
  beforeEachHook,
  afterAllHook,
} = require('./jest.config')

beforeEach(async () => {
  await beforeEachHook(TEST_DATA)
})

describe('GET /users', () => {
  test('Get a list with one user', async () => {
    const res = await request(app)
      .get('/users')
      .send({ _token: `${TEST_DATA.userToken}` })

    expect(res.statusCode).toBe(200)
    expect(res.body.users[0]).toHaveProperty('username')
    expect(res.body.users[0]).not.toHaveProperty('password')
  })
})

describe('GET /users/username', () => {
  test('Get data on a single user by username', async () => {
    const res = await request(app)
      .get(`/users/${TEST_DATA.currentUsername}`)
      .send({ _token: `${TEST_DATA.userToken}` })
    expect(res.statusCode).toBe(200)
    expect(res.body.user).toHaveProperty('username')
    expect(res.body.user).not.toHaveProperty('password')
    expect(res.body.user.username).toBe('test')
  })

  test('Attempt to find a user with invalid username', async () => {
    const res = await request(app)
      .get('/users/invalid-username')
      .send({ _token: `${TEST_DATA.userToken}` })
    expect(res.statusCode).toBe(404)
  })
})

describe('POST /users', () => {
  test('Add new user to the database', async () => {
    const newUser = {
      username: 'newuser',
      password: 'password',
      first_name: 'Gwendolyn',
      last_name: 'Brooks',
      email: 'gbrooks@example.com',
    }

    const res = await request(app).post(`/users`).send(newUser)

    expect(res.statusCode).toBe(201)
    expect(res.body).toHaveProperty('token')
  })

  test('Attempt to add user with invalid data', async () => {
    const newUser = {
      username: 'testuser',
      password: '',
      first_name: 'Test',
      last_name: 'User',
      email: 'tuser@example.com',
      photo_url: 75,
    }

    const res = await request(app).post(`/users`).send(newUser)

    expect(res.statusCode).toBe(400)
  })
})

describe('PATCH /users/:username', () => {
  test('Update a single user', async () => {
    const res = await request(app)
      .patch(`/users/${TEST_DATA.currentUsername}`)
      .send({
        first_name: 'killer',
        _token: `${TEST_DATA.userToken}`,
      })

    const user = res.body.user
    expect(user).toHaveProperty('username')
    expect(user).not.toHaveProperty('password')
    expect(user.first_name).toBe('killer')
  })

  test("Update a single user's password", async () => {
    const response = await request(app)
      .patch(`/users/${TEST_DATA.currentUsername}`)
      .send({ _token: `${TEST_DATA.userToken}`, password: 'password1234' })

    const user = response.body.user
    expect(user).toHaveProperty('username')
    expect(user).not.toHaveProperty('password')
  })

  test('Prevent a user from editing another user', async () => {
    const response = await request(app)
      .patch(`/users/otheruser`)
      .send({ password: 'password1234', _token: `${TEST_DATA.userToken}` })

    expect(response.statusCode).toBe(401)
  })
})

describe('DELETE /users/:username', () => {
  test('Delete a single user by username', async () => {
    const res = await request(app)
      .delete(`/users/${TEST_DATA.currentUsername}`)
      .send({ _token: `${TEST_DATA.userToken}` })

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ message: 'User deleted' })
  })

  test('Attempt to delete a user with invalid username', async () => {
    const res = await request(app)
      .delete('/users/invalid-user')
      .send({ _token: `${TEST_DATA.userToken}` })

    expect(res.statusCode).toBe(404)
    expect(res.body.message).toEqual(
      'There is no user with a username of invalid-user'
    )
  })
})

afterEach(async () => {
  await afterEachHook()
})

afterAll(async () => {
  await afterAllHook()
})
