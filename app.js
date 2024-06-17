const express = require('express');
const cors = require('cors');
const { handleBadRequest, handleErrorMessage, handleServerError } = require('./error-handler')

const apiRouter = require('./routes/api.router');
const topicsRouter = require('./routes/topics.router');
const articlesRouter = require('./routes/articles.router');
const commentsRouter = require('./routes/comments.router');
const usersRouter = require('./routes/users.router');

const app = express();

app.use(cors());

app.use(express.json());

app.use('/api', apiRouter);
app.use('/api/topics', topicsRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/users', usersRouter);

app.use(handleBadRequest);
app.use(handleErrorMessage);
app.use(handleServerError);

module.exports = app;