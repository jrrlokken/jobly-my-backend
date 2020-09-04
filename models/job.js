const db = require('../db')

class Job {
  static async findAll() {
    const res = await db.query(
      `SELECT id,
              title,
              salary,
              equity,
              company_handle,
              date_posted
          FROM jobs
          ORDER BY date_posted DESC`
    )

    return res.rows
  }

  static async findOne(id) {
    const res = await db.query(
      `SELECT id,
              title,
              salary,
              equity,
              company_handle,
              date_posted
          FROM jobs
          WHERE id = $1`,
      [id]
    )

    if (res.rows.length === 0) {
      throw {
        message: `There is no job with an id of ${id}`,
        status: 404,
      }
    }

    return res.rows[0]
  }

  static async create(data) {
    const result = await db.query(
      `INSERT INTO jobs (
            title,
            salary,
            equity,
            company_handle 
         VALUES ($1, $2, $3, $4) 
         RETURNING id,
                   title,
                   salary,
                   equity,
                   company_handle,
                   date_posted`,
      [data.title, data.salary, data.equity, data.company_handle]
    )

    return result.rows[0]
  }

  static async update(id, data) {
    const result = await db.query(
      `UPDATE jobs SET
            title=($1),
            salary=($2),
            equity=($3),
            company_handle=($4)
          WHERE id=$5
        RETURNING id,
                  title,
                  salary,
                  equity,
                  company_handle,
                  date_posted`,
      [data.title, data.salary, data.equity, data.company_handle, id]
    )

    if (result.rows.length === 0) {
      throw {
        message: `There is no job with an id of ${id}`,
        status: 404,
      }
    }

    return result.rows[0]
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

module.exports = Company
