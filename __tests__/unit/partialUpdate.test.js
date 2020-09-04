process.env.NODE_ENV = 'test'

const request = require('supertest')
const sqlForPartialUpdate = require('../../helpers/partialUpdate')

const app = require('../../app')
const db = require('../../db')

describe('partialUpdate()', () => {
  it('should generate a proper partial update query with just 1 field', function () {
    const update = sqlForPartialUpdate(
      'companies',
      {
        handle: 'testcorp',
        name: 'Test Corporation',
        num_employees: 50,
        description: 'Corporation dedicated to testing javascript.',
        logo_url: 'https://via.placeholder.com/200',
      },
      'handle',
      1
    )
    const query = `UPDATE companies
                        SET handle=$${1},
                            name=$${2},
                            num_employees=$${3},
                            description=$${4},
                            logo_url=$${5}
                      WHERE handle=$${6}
                      RETURNING *`

    const values = [
      'testcorp',
      'Test Corporation',
      50,
      'Corporation dedicated to testing javascript.',
      'https://via.placeholder.com/200',
      1,
    ]

    expect(update).toEqual({ query, values })
  })
})

afterAll(async () => {
  await db.end()
})
