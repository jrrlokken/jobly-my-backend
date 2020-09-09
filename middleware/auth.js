const jwt = require('jsonwebtoken')
const { SECRET_KEY } = require('../config')
const ExpressError = require('../helpers/expressError')

function authRequired(req, res, next) {
  try {
    const tokenString = req.body._token || req.query._token

    let token = jwt.verify(tokenString, SECRET_KEY)
    res.locals.username = token.username
    return next()
  } catch (error) {
    return next(new ExpressError('Authentication required.', 401))
  }
}

function ensureCorrectUser(req, res, next) {
  try {
    const tokenString = req.body._token

    let token = jwt.verify(tokenString, SECRET_KEY)
    res.locals.username = token.username

    if (token.username === req.params.username) {
      return next()
    }
    throw new Error()
  } catch (error) {
    return next(new ExpressError('Unauthorized.', 401))
  }
}

function adminRequired(req, res, next) {
  try {
    const tokenString = req.body._token

    let token = jwt.verify(tokenString, SECRET_KEY)
    res.locals.username = token.username

    if (token.is_admin) {
      return next()
    }

    throw new Error()
  } catch (error) {
    return next(new ExpressError('Admin privileges required.', 401))
  }
}

module.exports = {
  authRequired,
  ensureCorrectUser,
  adminRequired,
}
