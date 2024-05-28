const db = require('../../db/connection')

exports.selectTopics = () => {
    const selectQuery = `SELECT * FROM topics`
    return db.query(selectQuery)
}