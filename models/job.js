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
          ORDER BY id`
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

  // static async update(handle, data) {
  //   const result = await db.query(
  //     `UPDATE companies SET
  //           name=($1),
  //           num_employees=($2),
  //           description=($3),
  //           logo_url=($4)
  //         WHERE handle=$5
  //       RETURNING handle,
  //                 name,
  //                 num_employees,
  //                 description,
  //                 logo_url`,
  //     [data.name, data.num_employees, data.description, data.logo_url, handle]
  //   )

  //   if (result.rows.length === 0) {
  //     throw {
  //       message: `There is no company with a handle of ${handle}`,
  //       status: 404,
  //     }
  //   }

  //   return result.rows[0]
  // }

  /** remove book with matching isbn. Returns undefined. */

  // static async remove(handle) {
  //   const result = await db.query(
  //     `DELETE FROM companies
  //        WHERE handle = $1
  //        RETURNING handle`,
  //     [handle]
  //   )

  //   if (result.rows.length === 0) {
  //     throw {
  //       message: `There is no company with a handle of ${handle}`,
  //       status: 404,
  //     }
  //   }
  // }
}

module.exports = Company
