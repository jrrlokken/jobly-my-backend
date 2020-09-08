const db = require('../db')
const sqlForPartialUpdate = require('../helpers/partialUpdate')

class Job {
  static async findAll() {
    let baseQuery = `SELECT id, title, company_handle FROM jobs`
    let whereClause = []
    let queryValues = []

    if (data.min_salary) {
      queryValues.push(+data.min_salary)
      whereClause.push(`min_salary >= $${queryValues.length}`)
    }

    if (data.max_quity) {
      queryValues.push(+data.max_equity)
      whereClause.push(`max_equity <= $${queryValues.length}`)
    }

    if (data.search) {
      queryValues.push(`%${data.search}%`)
      whereClause.push(`name ILIKE $${queryValues.length}`)
    }

    if (whereClause.length > 0) {
      baseQuery += ' WHERE '
    }

    // Here is the final query

    let finalQuery = baseQuery + whereClause.join(' AND ')
    const jobs = await db.query(finalQuery, queryValues)
    return jobs.rows
  }

  static async findOne(id) {
    const jobResponse = await db.query(
      `SELECT id,
              title,
              salary,
              equity,
              company_handle
          FROM jobs
          WHERE id = $1`,
      [id]
    )

    const job = jobResponse.rows[0]

    if (!job) {
      throw {
        message: `There is no job with an id of ${id}`,
        status: 404,
      }
    }

    const companyResponse = await db.query(
      `SELECT name, num_employees, description, logo_url
        FROM companies
        WHERE handle = $1`,
      [job.company_handle]
    )

    job.company = companyResponse.rows[0]

    return job
  }

  static async create(data) {
    const result = await db.query(
      `INSERT INTO jobs (
            title,
            salary,
            equity,
            company_handle )
         VALUES ($1, $2, $3, $4) 
         RETURNING id,
                   title,
                   salary,
                   equity,
                   company_handle`,
      [data.title, data.salary, data.equity, data.company_handle]
    )

    return result.rows[0]
  }

  static async update(data) {
    const { query, values } = sqlForPartialUpdate('jobs', data, 'id', id)
    const result = await db.query(query, values)
    const job = result.rows[0]

    if (!job) {
      throw {
        message: `There is no job with an id of ${id}`,
        status: 404,
      }
    }

    return job
  }

  static async remove(id) {
    const result = await db.query(
      `DELETE FROM jobs
         WHERE id = $1
         RETURNING id`,
      [id]
    )

    if (result.rows.length === 0) {
      throw {
        message: `There is no job with an id of ${id}`,
        status: 404,
      }
    }
  }
}

module.exports = Job
