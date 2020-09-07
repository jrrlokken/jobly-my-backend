const Router = require('express').Router
const jsonschema = require('jsonschema')

const Company = require('../models/company')
const { companyNewSchema, companyUpdateSchema } = require('../schemas/')
const ExpressError = require('../helpers/expressError')
const db = require('../db')

const router = new Router()

router.get('/', async function (req, res, next) {
  try {
    let searchTerm = req.query.search
    let companies

    if (!searchTerm) {
      companies = await Company.findAll(req.query)
    } else {
      companies = await Company.findOne(searchTerm)
    }

    let min_employees = req.query.min_employees
    let max_employees = req.query.max_employees

    if (min_employees > max_employees) {
      throw new ExpressError('Invalid parameters.', 400)
    }

    return res.json({ companies })
  } catch (error) {
    return next(error)
  }
})

router.get('/:handle', async function (req, res, next) {
  try {
    const company = await Company.findOne(req.params.handle)
    return res.json({ company })
  } catch (err) {
    return next(err)
  }
})

router.post('/', async function (req, res, next) {
  try {
    const validation = validate(req.body, companyNewSchema)

    if (!validation.valid) {
      let errorList = result.errors.map((error) => error.stack)
      let error = new ExpressError(errorList, 400)
      return next(error)
    }

    const company = await Company.create(req.body)
    return res.status(201).json({ company })
  } catch (err) {
    return next(err)
  }
})

router.patch('/:handle', async function (req, res, next) {
  try {
    const validation = validate(req.body, companyUpdateSchema)

    if (!validation.valid) {
      let errorList = result.errors.map((error) => error.stack)
      let error = new ExpressError(errorList, 400)
      return next(error)
    }

    const company = await Company.update(req.params.handle, req.body)
    return res.json({ company })
  } catch (err) {
    return next(err)
  }
})

router.delete('/:handle', async function (req, res, next) {
  try {
    await Company.remove(req.params.handle)
    return res.json({ message: 'Company deleted' })
  } catch (err) {
    return next(err)
  }
})

module.exports = router
