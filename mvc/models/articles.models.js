const db = require('../../db/connection')

exports.fetchArticleById = (id) => {    
    const selectQuery = `SELECT * FROM articles WHERE article_id = $1`
    return db.query(selectQuery, [id]).then((result) => {
        if (result.rows.length === 0) {
            return Promise.reject({
                status: 404,
                msg: 'Not found'
            })
        } else return result.rows[0]
    })
}