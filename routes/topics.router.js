const topicsRouter = require('express').Router()
const { getAllTopics } = require('../mvc/controllers/topics.controller')

topicsRouter.get('/', getAllTopics);

module.exports = topicsRouter;