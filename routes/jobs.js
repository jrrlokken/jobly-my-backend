const Router = require('express').Router
const jsonschema = require('jsonschema')

const Job = require('../models/job')
const jobSchema = require('../schemas/jobSchema.json')
const ExpressError = require('../helpers/expressError')

const router = new Router()

router.get('/', async function (req, res, next) {
  try {
    const jobs = await Job.findAll(req.query)

    return res.json({ jobs })
  } catch (error) {
    return next(error)
  }
})

router.get('/:id', async function (req, res, next) {
  try {
    const job = await Job.findOne(req.params.handle)
    return res.json({ job })
  } catch (err) {
    return next(err)
  }
})

router.post('/', async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, jobSchema)

    if (!result.valid) {
      let errorList = result.errors.map((error) => error.stack)
      let error = new ExpressError(errorList, 400)
      return next(error)
    }

    const job = await Job.create(req.body)
    return res.status(201).json({ job })
  } catch (err) {
    return next(err)
  }
})

router.patch('/:id', async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, jobSchema)

    if (!result.valid) {
      let errorList = result.errors.map((error) => error.stack)
      let error = new ExpressError(errorList, 400)
      return next(error)
    }

    const job = await Job.update(req.params.id, req.body)
    return res.json({ job })
  } catch (err) {
    return next(err)
  }
})

router.delete('/:id', async function (req, res, next) {
  try {
    await Job.remove(req.params.id)
    return res.json({ message: 'Job deleted' })
  } catch (err) {
    return next(err)
  }
})

module.exports = router
