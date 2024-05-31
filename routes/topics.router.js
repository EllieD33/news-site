const topicsRouter = require('express').Router()
const { getAllTopics, addTopic } = require('../mvc/controllers/topics.controller')

topicsRouter.get('/', getAllTopics);
topicsRouter.post('/', addTopic);

module.exports = topicsRouter;