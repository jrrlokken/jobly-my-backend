const express = require('express')
const { validate } = require('jsonschema')
const { authRequired, adminRequired } = require('../middleware/auth')
const Job = require('../models/job')
const { jobNewSchema, jobUpdateSchema } = require('../schemas')
const ExpressError = require('../helpers/expressError')

const router = express.Router({ mergeParams: true })

router.get('/', authRequired, async function (req, res, next) {
  try {
    const jobs = await Job.findAll(req.query)
    return res.json({ jobs })
  } catch (error) {
    return next(error)
  }
})

router.get('/:id', authRequired, async function (req, res, next) {
  try {
    const job = await Job.findOne(req.params.id)
    return res.json({ job })
  } catch (err) {
    return next(err)
  }
})

router.post('/', adminRequired, async function (req, res, next) {
  try {
    const validation = validate(req.body, jobNewSchema)

    if (!validation.valid) {
      throw new ExpressError(validation.errors.map(e => e.stack), 400);
    }

    const job = await Job.create(req.body)
    return res.status(201).json({ job })
  } catch (err) {
    return next(err)
  }
})

router.patch('/:id', adminRequired, async function (req, res, next) {
  try {
    if ('id' in req.body) {
      throw new ExpressError('Changing the ID is not allowed.', 400);
    }

    const validation = validate(req.body, jobUpdateSchema)

    if (!validation.valid) {
      throw new ExpressError(validation.errors.map(e => e.stack), 400);
    }

    const job = await Job.update(req.params.id, req.body)
    return res.json({ job })
  } catch (err) {
    return next(err)
  }
})

router.delete('/:id', adminRequired, async function (req, res, next) {
  try {
    await Job.remove(req.params.id)
    return res.json({ message: 'Job deleted' })
  } catch (err) {
    return next(err)
  }
})

module.exports = router
