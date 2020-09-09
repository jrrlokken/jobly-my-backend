const db = require('../db')
const bcrypt = require('bcrypt')
const partialUpdate = require('../helpers/partialUpdate')
const ExpressError = require('../helpers/expressError')
const { BCRYPT_WORK_FACTOR } = require('../config')

class User {
  static async authenticate(data) {
    const result = await db.query(
      `SELECT username,
              password,
              first_name,
              last_name,
              email,
              photo_url,
              is_admin
        FROM users
        WHERE username = $1`,
      [data.username]
    )

    const user = result.rows[0]

    if (user) {
      const isValid = await bcrypt.compare(data.password, user.password)
      if (isValid) {
        return user
      }
    }

    throw new ExpressError('Invalid password', 401)
  }

  static async register(data) {
    const userCheck = await db.query(
      `SELECT username
        FROM users
        WHERE username = $1`,
      [data.username]
    )

    if (userCheck.rows[0]) {
      throw new ExpressError(`User ${data.username} already exists.`, 400)
    }

    const hashedPassword = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR)

    const result = await db.query(
      `INSERT INTO users
          (username, password, first_name, last_name, email, photo_url)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING username, password, first_name, last_name, email, photo_url`,
      [
        data.username,
        hashedPassword,
        data.first_name,
        data.last_name,
        data.email,
        data.photo_url,
      ]
    )

    return result.rows[0]
  }

  static async findAll() {
    const result = await db.query(
      `SELECT username, first_name, last_name, email
        FROM users
        ORDER BY username`
    )

    return result.rows
  }

  static async findOne(username) {
    const userFind = await db.query(
      `SELECT username, first_name, last_name, photo_url
        FROM users
        WHERE username = $1`,
      [username]
    )

    const user = userFind.rows[0]

    if (!user) {
      throw new ExpressError(
        `There is no user with an username of ${username}`,
        404
      )
    }
    return user
  }

  static async update(username, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR)
    }

    let { query, values } = partialUpdate('users', data, 'username', username)

    const result = await db.query(query, values)
    const user = result.rows[0]

    if (!user) {
      throw new ExpressError(`User ${username} does not exist.`, 404)
    }

    delete user.password;
    delete user.is_admin;

    return result.rows[0]
  }

  static async remove(username) {
    const result = await db.query(
      `DELETE FROM users
         WHERE username = $1
         RETURNING username`,
      [username]
    )

    if (result.rows.length === 0) {
      throw new ExpressError(
        `There is no user with an username of ${username}`,
        404
      )
    }
  }
}

module.exports = User
