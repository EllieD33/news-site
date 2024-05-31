const db = require('../../db/connection')

exports.selectTopics = () => {
    const selectQuery = `SELECT * FROM topics`
    return db.query(selectQuery).then((result) => {return result.rows})
}

exports.postNewTopic = (slug, description) => {
    if (!slug || !description || typeof slug !== 'string' || typeof description !== 'string') {
        return Promise.reject({ status: 400, msg: "Bad request" });
    }

    const formattedTopic = [slug, description]
    const insertQuery = `INSERT INTO topics (slug, description) VALUES ($1, $2) RETURNING *;`
    return db.query(insertQuery, formattedTopic).then((result) => {
        return result.rows[0]
    })
}