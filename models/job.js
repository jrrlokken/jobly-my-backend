const db = require('../db')
const sqlForPartialUpdate = require('../helpers/partialUpdate')

class Job {
  // static async search(str = '', min = 0, equity = 0) {
  //   const result = await db.query(
  //     `SELECT * FROM jobs WHERE
  //               (title ILIKE $1 OR company_handle ILIKE $1) AND salary >= $2 AND equity >= $3`,
  //     [`%${str}%`, min, equity]
  //   )
  //   if (result.rows.length === 0) {
  //     throw new ExpressError('no results', 400)
  //   }
  //   return result.rows.map(
  //     (j) =>
  //       new Job(
  //         j.id,
  //         j.title,
  //         j.salary,
  //         j.equity,
  //         j.company_handle,
  //         j.date_posted
  //       )
  //   )
  // }

  static async findAll() {
    const res = await db.query(
      `SELECT title,
              company_handle
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
            company_handle )
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

  static async update(data) {
    const { query, values } = sqlForPartialUpdate('jobs', data, 'id', this.id)
    console.log(query, values)
    const result = await db.query(query, values)

    // const result = await db.query(
    //   `UPDATE jobs SET
    //         title=($1),
    //         salary=($2),
    //         equity=($3),
    //         company_handle=($4)
    //       WHERE id=$5
    //     RETURNING id,
    //               title,
    //               salary,
    //               equity,
    //               company_handle,
    //               date_posted`,
    //   [data.title, data.salary, data.equity, data.company_handle, id]
    // )

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

module.exports = Job
