const express = require('express');
const { handleBadRequest, handleErrorMessage, handleServerError } = require('./error-handler')
const { getAllTopics } = require('./mvc/controllers/topics.controller')
const { getArticleById, getArticles, getComments, addComment, updateArticle, deleteComment} = require('./mvc/controllers/articles.controller')
const { getUsers } = require('./mvc/controllers/users.controller')
const app = express();

app.use(express.json());

const apiRouter = require('./routes/api.router');
app.use('/api', apiRouter);

app.get('/api/topics', getAllTopics);

app.get('/api/articles', getArticles);

app.get('/api/articles/:article_id', getArticleById);
app.patch('/api/articles/:article_id', updateArticle);

app.get('/api/articles/:article_id/comments', getComments);
app.post('/api/articles/:article_id/comments', addComment);
app.delete('/api/comments/:comment_id', deleteComment);

app.get('/api/users', getUsers);

app.use(handleBadRequest);
app.use(handleErrorMessage);
app.use(handleServerError);

module.exports = app;