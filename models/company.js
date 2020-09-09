const db = require('../db')
const ExpressError = require('../helpers/expressError')
const partialUpdate = require('../helpers/partialUpdate')

class Company {
  static async findAll(data) {
    let baseQuery = `SELECT handle, name FROM companies`
    let whereClause = []
    let queryValues = []

    if (+data.min_employees >= +data.max_employees) {
      throw new ExpressError(
        'Min employees must be less than max employees',
        400
      )
    }

    if (data.min_employees) {
      queryValues.push(+data.min_employees)
      whereClause.push(`num_employees >= $${queryValues.length}`)
    }

    if (data.max_employees) {
      queryValues.push(+data.max_employees)
      whereClause.push(`num_employees <= $${queryValues.length}`)
    }

    if (data.search) {
      queryValues.push(`%${data.search}%`)
      whereClause.push(`name ILIKE $${queryValues.length}`)
    }

    if (whereClause.length > 0) {
      baseQuery += ' WHERE '
    }

    // Here is the final query

    let finalQuery = baseQuery + whereClause.join(' AND ') + ' ORDER BY name'
    const companies = await db.query(finalQuery, queryValues)
    return companies.rows
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
      throw new ExpressError(`There is no company with a handle of ${handle}`, 404)
    }

    return res.rows[0]
  }

  static async create(data) {
    const checkExists = await db.query(
      `SELECT handle
        FROM companies
        WHERE handle = $1`,
      [data.handle]
    )

    if (checkExists.rows[0]) {
      throw new ExpressError(`Company ${data.handle} exists.`, 400)
    }

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
    let { query, values } = partialUpdate("companies", data, "handle", handle)

    const result = await db.query(query, values);
    const company = result.rows[0];

    if (!company) {
      throw new ExpressError(`There is no company with a handle of ${handle}`, 404)
    }

    return company;
  }

  static async remove(handle) {
    const result = await db.query(
      `DELETE FROM companies 
         WHERE handle = $1 
         RETURNING handle`,
      [handle]
    )

    if (result.rows.length === 0) {
      throw new ExpressError(`There is no company with a handle of ${handle}`, 404)
    }
  }
}

module.exports = Company
