const commentsRouter = require('express').Router()
const { deleteComment } = require('../mvc/controllers/articles.controller')

commentsRouter.delete('/:comment_id', deleteComment);

module.exports = commentsRouter;