const apiRouter = require('express').Router()
const { getEndpoints } = require('../mvc/controllers/api.controller')

apiRouter.get('/', getEndpoints);

module.exports = apiRouter;