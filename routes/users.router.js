const usersRouter = require('express').Router()
const { getUsers } = require('../mvc/controllers/users.controller')

usersRouter.get('/', getUsers);

module.exports = usersRouter;