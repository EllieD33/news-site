const db = require('../../db/connection')

exports.fetchArticleById = (id) => {
    const selectQuery = `SELECT * FROM articles WHERE article_id = $1`
    return db.query(selectQuery, [id])
}