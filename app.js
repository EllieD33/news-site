const express = require('express');
const { handleBadRequest, handleErrorMessage, handleServerError } = require('./error-handler')
const { getEndpoints } = require('./mvc/controllers/api.controller')
const { getAllTopics } = require('./mvc/controllers/topics.controller')
const { getArticleById, getArticles, getComments } = require('./mvc/controllers/articles.controller')
const app = express();

app.use(express.json());

app.get('/api', getEndpoints);

app.get('/api/topics', getAllTopics);

app.get('/api/articles', getArticles);
app.get('/api/articles/:article_id', getArticleById);
app.get('/api/articles/:article_id/comments', getComments);

app.use(handleBadRequest);
app.use(handleErrorMessage);
app.use(handleServerError);

module.exports = app;