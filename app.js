const express = require('express');
const { handleBadRequest, handleErrorMessage, handleServerError } = require('./error-handler')
const { getEndpoints } = require('./mvc/controllers/api.controller')
const { getAllTopics } = require('./mvc/controllers/topics.controller')
const app = express();

app.use(express.json());

app.get('/api', getEndpoints);

app.get('/api/topics', getAllTopics);

app.use(handleBadRequest);
app.use(handleErrorMessage);
app.use(handleServerError);

module.exports = app;