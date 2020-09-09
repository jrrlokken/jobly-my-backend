const express = require('express')
const { validate } = require('jsonschema')

const Company = require('../models/company')
const { companyNewSchema, companyUpdateSchema } = require('../schemas/')
const { authRequired, adminRequired } = require('../middleware/auth')
const ExpressError = require('../helpers/expressError')
const db = require('../db')

const router = express.Router()

router.get('/', authRequired, async function (req, res, next) {
  try {
    const companies = await Company.findAll(req.query);
    return res.json({ companies })
  } catch (error) {
    return next(error)
  }
})

router.get('/:handle', authRequired, async function (req, res, next) {
  try {
    const company = await Company.findOne(req.params.handle)
    return res.json({ company })
  } catch (err) {
    return next(err)
  }
})

router.post('/', adminRequired, async function (req, res, next) {
  try {
    const validation = validate(req.body, companyNewSchema)

    if (!validation.valid) {
      throw new ExpressError(validation.errors.map(e => e.stack), 400)
    }

    const company = await Company.create(req.body)
    return res.status(201).json({ company })
  } catch (err) {
    return next(err)
  }
})

router.patch('/:handle', adminRequired, async function (req, res, next) {
  try {
    if ('handle' in req.body) {
      throw new ExpressError('Changing the handle is not allowed.', 400)
    }
    
    const validation = validate(req.body, companyUpdateSchema)

    if (!validation.valid) {
      let errorList = validation.errors.map((error) => error.stack)
      let error = new ExpressError(errorList, 400)
      return next(error)
    }

    const company = await Company.update(req.params.handle, req.body)
    return res.json({ company })
  } catch (err) {
    return next(err)
  }
})

router.delete('/:handle', adminRequired, async function (req, res, next) {
  try {
    await Company.remove(req.params.handle)
    return res.json({ message: 'Company deleted' })
  } catch (err) {
    return next(err)
  }
})

module.exports = router
