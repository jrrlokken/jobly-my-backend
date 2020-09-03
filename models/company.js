const db = require('../db')

class Company {
  static async findAll() {
    const res = await db.query(
      `SELECT handle,
              name,
              num_employees,
              description,
              logo_url
          FROM companies
          ORDER BY handle`
    )

    return res.rows
  }

  static async findOne(handle) {
    const res = await db.query(
      `SELECT handle,
              name,
              num_employees,
              description,
              logo_url
          FROM companies
          WHERE handle = $1`,
      [handle]
    )

    if (res.rows.length === 0) {
      throw {
        message: `There is no company with a handle of ${handle}`,
        status: 404,
      }
    }

    return res.rows[0]
  }

  static async create(data) {
    const result = await db.query(
      `INSERT INTO companies (
            handle,
            name,
            num_employees,
            description,
            logo_url) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING handle,
                   name,
                   num_employees,
                   description,
                   logo_url`,
      [
        data.handle,
        data.name,
        data.num_employees,
        data.description,
        data.logo_url,
      ]
    )

    return result.rows[0]
  }

  static async update(handle, data) {
    const result = await db.query(
      `UPDATE companies SET 
            name=($1),
            num_employees=($2),
            description=($3),
            logo_url=($4)
          WHERE handle=$5
        RETURNING handle,
                  name,
                  num_employees,
                  description,
                  logo_url`,
      [data.name, data.num_employees, data.description, data.logo_url, handle]
    )

    if (result.rows.length === 0) {
      throw {
        message: `There is no company with a handle of ${handle}`,
        status: 404,
      }
    }

    return result.rows[0]
  }

  /** remove book with matching isbn. Returns undefined. */

  static async remove(handle) {
    const result = await db.query(
      `DELETE FROM companies 
         WHERE handle = $1 
         RETURNING handle`,
      [handle]
    )

    if (result.rows.length === 0) {
      throw {
        message: `There is no company with a handle of ${handle}`,
        status: 404,
      }
    }
  }
}

module.exports = Company
