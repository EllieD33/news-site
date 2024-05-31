const articlesRouter = require('express').Router()
const { getArticleById, getArticles, getComments, addComment, updateArticle, addArticle, deleteArticle } = require('../mvc/controllers/articles.controller')

articlesRouter.get('/', getArticles)
articlesRouter.post('/', addArticle)

articlesRouter.get('/:article_id', getArticleById);
articlesRouter.patch('/:article_id', updateArticle);
articlesRouter.delete('/:article_id', deleteArticle);

articlesRouter.get('/:article_id/comments', getComments);
articlesRouter.post('/:article_id/comments', addComment);

module.exports = articlesRouter;