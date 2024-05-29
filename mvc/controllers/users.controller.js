const { fetchUsers } = require('../models/users.models')

exports.getUsers = (req, res, next) => {
    fetchUsers().then((result) => {
        const users = result.rows
        res.status(200).send({ users })
    }).catch(next)
}