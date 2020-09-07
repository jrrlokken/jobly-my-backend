const Router = require('express').Router
const { validate } = require('jsonschema')

const User = require('../models/user')
const { userNewSchema, userUpdateSchema } = require('../schemas')
const ExpressError = require('../helpers/expressError')

const router = new Router()

router.get('/', async function (req, res, next) {
  try {
    const users = await User.findAll()

    return res.json({ users })
  } catch (error) {
    return next(error)
  }
})

router.get('/:username', async function (req, res, next) {
  try {
    const user = await User.findOne(req.params.username)
    return res.json({ user })
  } catch (err) {
    return next(err)
  }
})

router.post('/', async function (req, res, next) {
  try {
    const validation = validate(req.body, userNewSchema)

    if (!validation.valid) {
      throw new ExpressError(
        validation.errors.map((e) => e.stack),
        400
      )
    }

    const newUser = await User.register(req.body)
    return res.status(201).json({ newUser })
  } catch (err) {
    return next(err)
  }
})

router.patch('/:username', async function (req, res, next) {
  try {
    if ('username' in req.body || 'is_admin' in req.body) {
      throw new ExpressError(
        'Not authorized to change username or is_admin properties.',
        400
      )
    }

    const validation = validate(req.body, userUpdateSchema)
    if (!validation.valid) {
      throw new ExpressError(
        validation.errors.map((e) => e.stack),
        400
      )
    }

    const user = await User.update(req.params.username, req.body)
    return res.json({ user })
  } catch (err) {
    return next(err)
  }
})

router.delete('/:id', async function (req, res, next) {
  try {
    await User.remove(req.params.username)
    return res.json({ message: 'User deleted' })
  } catch (err) {
    return next(err)
  }
})

module.exports = router