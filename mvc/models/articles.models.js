const db = require('../../db/connection');
const format = require("pg-format");

const checkExists = async (table, column, value) => {
    const queryStr = format("SELECT * FROM %I WHERE %I = $1;", table, column);
    const dbOutput = await db.query(queryStr, [value]);

    if (dbOutput.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not found" });
    }
}

exports.fetchArticleById = async (id) => {    
    const selectQuery = `SELECT 
        articles.author, 
        articles.title, 
        articles.article_id, 
        articles.topic, 
        articles.body,
        articles.created_at, 
        articles.votes, 
        articles.article_img_url, 
        COUNT(comments.comment_id) AS comment_count 
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
    WHERE articles.article_id = $1
    GROUP BY articles.article_id;`

    await checkExists('articles', 'article_id', id)

    return db.query(selectQuery, [id]).then((result) => {
        return result.rows[0]
    })
}

exports.fetchArticles = async (topic) => {   
    let selectQuery = `SELECT 
        articles.author, 
        articles.title, 
        articles.article_id, 
        articles.topic, 
        articles.created_at, 
        articles.votes, 
        articles.article_img_url, 
        COUNT(comments.comment_id) AS comment_count 
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id`;
    const queryValues = [];

    if (topic) {
        const topics = await db.query(`SELECT slug FROM topics;`)
        validTopics = topics.rows.map((topic) => Object.values(topic)).flat()
        if (!validTopics.includes(topic)) {
            return Promise.reject({ status: 400, msg: "Bad request" });
        } else {
            selectQuery += ' WHERE topic = $1'
            queryValues.push(topic)
        }
    }
    
    selectQuery += ` GROUP BY articles.article_id
        ORDER BY articles.created_at DESC`

    return db.query(selectQuery, queryValues)
}

exports.fetchComments = async (id) => {
    if (isNaN(id)) {
        return Promise.reject({
            status: 400,
            msg: 'Bad request'
        });
    }

    await checkExists('articles', 'article_id', id); 

    const selectQuery = `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC`
    return db.query(selectQuery, [id]).then((result) => {
        if (result.rows.length === 0) {
            return []
        } else return result.rows
    })
}

exports.insertComment = async (article_id, author, body) => {
    if (!article_id || !author || !body) {
        return Promise.reject({
            status: 400,
            msg: 'Bad request'
        });
    }

    await checkExists('articles', 'article_id', article_id);
    await checkExists('users', 'username', author); 

    const formattedComment = [article_id, author, body]
    const insertQuery = format(`INSERT INTO comments (article_id, author, body) VALUES ($1, $2, $3) RETURNING *;`)
    return db.query(insertQuery, formattedComment)
}

exports.updateVotes = async (article_id, votes) => {
    if (!article_id || !votes) {
        return Promise.reject({
            status: 400,
            msg: 'Bad request'
        });
    }

    await checkExists('articles', 'article_id', article_id);

    return db.query(`SELECT votes FROM articles WHERE article_id = $1`, [article_id])
        .then((result) => {
            updatedVotes = result.rows[0].votes + votes
            return db.query(`UPDATE articles SET votes = $1 WHERE article_id = $2 RETURNING *;`, [updatedVotes, article_id])
        })
}

exports.removeComment = async (comment_id) => {
    if (!comment_id) {
        return Promise.reject({
            status: 400,
            msg: 'Bad request'
        });
    }

    await checkExists('comments', 'comment_id', comment_id);

    return db.query(`DELETE FROM comments WHERE comment_id = $1`, [comment_id]);
}
