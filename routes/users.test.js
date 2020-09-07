process.env.NODE_ENV = 'test'

const request = require('supertest')

const app = require('../app')
const db = require('../db')

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

describe('POST /users', () => {
  test('Add new user to the database', async () => {
    const newUser = {
      username: 'newuser',
      password: 'password',
      first_name: 'Gwendolyn',
      last_name: 'Brooks',
      email: 'gbrooks@example.com',
      photo_url: 'https://via.placeholder.com/200',
    }

    const resp = await request(app).post(`/users`).send(newUser)
    expect(resp.statusCode).toBe(201)
    expect(resp.body).toEqual({
      user: newUser,
    })
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
    // expect(res.body.message).toEqual([
    //   'instance.num_employees is not of a type(s) integer',
    // ])
  })
})

describe('PATCH /users/:username', () => {
  test('Update a single user', async () => {
    user.first_name = 'Garrett'

    const res = await request(app).patch(`/users/${user.username}`).send(user)

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ user: user })
  })
})

describe('DELETE /users/:username', () => {
  test('Delete a single user by username', async () => {
    const res = await request(app).delete(`/users/${user.username}`)

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ message: 'User deleted' })
  })

  test('Attempt to delete a user with invalid username', async () => {
    const res = await request(app).delete('/users/superuser')

    expect(res.statusCode).toBe(404)
    expect(res.body.message).toEqual(
      'There is no user with a username of superuser'
    )
  })
})

afterEach(async () => {
  await db.query('DELETE FROM users')
})

afterAll(async () => {
  await db.end()
})
