const express = require('express');
const { handleBadRequest, handleErrorMessage, handleServerError } = require('./error-handler')
const { getUsers } = require('./mvc/controllers/users.controller')
const app = express();

app.use(express.json());

const apiRouter = require('./routes/api.router');
const topicsRouter = require('./routes/topics.router');
const articlesRouter = require('./routes/articles.router');
const commentsRouter = require('./routes/comments.router');

app.use('/api', apiRouter);
app.use('/api/topics', topicsRouter)
app.use('/api/articles', articlesRouter)
app.use('/api/comments', commentsRouter);

app.get('/api/users', getUsers);

app.use(handleBadRequest);
app.use(handleErrorMessage);
app.use(handleServerError);

module.exports = app;