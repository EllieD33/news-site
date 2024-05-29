const express = require('express');
const { handleBadRequest, handleErrorMessage, handleServerError } = require('./error-handler')
const { getEndpoints } = require('./mvc/controllers/api.controller')
const { getAllTopics } = require('./mvc/controllers/topics.controller')
const { getArticleById, getArticles, getComments, addComment, updateArticle } = require('./mvc/controllers/articles.controller')
const app = express();

app.use(express.json());

app.get('/api', getEndpoints);

app.get('/api/topics', getAllTopics);

app.get('/api/articles', getArticles);

app.get('/api/articles/:article_id', getArticleById);
app.patch('/api/articles/:article_id', updateArticle);

app.get('/api/articles/:article_id/comments', getComments);
app.post('/api/articles/:article_id/comments', addComment);

app.use(handleBadRequest);
app.use(handleErrorMessage);
app.use(handleServerError);

module.exports = app;