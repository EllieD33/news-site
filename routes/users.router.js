const usersRouter = require('express').Router()
const { getUsers, getUserByUsername } = require('../mvc/controllers/users.controller')

usersRouter.get('/', getUsers);
usersRouter.get('/:username', getUserByUsername);

module.exports = usersRouter;