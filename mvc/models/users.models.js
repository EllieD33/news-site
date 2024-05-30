const db = require('../../db/connection');
const { checkExists } = require('./articles.models')

exports.fetchUsers = () => {
    return db.query(`SELECT * FROM users`).then((result) => {
        return result.rows
    })
}

exports.fetchUserByUsername = (username) => {
    const selectQuery = 'SELECT * FROM users WHERE username = $1'

    return checkExists('users', 'username', username).then(() => {
        return db.query(selectQuery, [username])
    }).then((result) => {
        return result.rows[0];
    })
}