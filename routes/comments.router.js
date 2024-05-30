const commentsRouter = require('express').Router()
const { deleteComment, updateComment } = require('../mvc/controllers/articles.controller')

commentsRouter.delete('/:comment_id', deleteComment);
commentsRouter.patch('/:comment_id', updateComment);

module.exports = commentsRouter;