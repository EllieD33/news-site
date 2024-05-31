const db = require("../../db/connection");
const format = require("pg-format");

exports.checkExists = (table, column, value) => {
    const queryStr = format("SELECT * FROM %I WHERE %I = $1;", table, column);
    return db.query(queryStr, [value]).then((result) => {
        if (result.rows.length === 0) {
            return Promise.reject({ status: 404, msg: "Not found" });
        }
    });
};

exports.fetchArticleById = (article_id) => {
    if (isNaN(article_id)) {
        return Promise.reject({ status: 400, msg: "Bad request" });
    }

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
    GROUP BY articles.article_id;`;

    return exports
        .checkExists("articles", "article_id", article_id)
        .then(() => {
            return db.query(selectQuery, [article_id]);
        })
        .then((result) => {
            const article = { ...result.rows[0] }
            article.comment_count = Number(article.comment_count)
            return article;
        });
};

exports.fetchArticles = (topic, sortBy, order, pageLimit, page) => {
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

    const validSorts = ["author", "title", "topic", "votes", "comment_count"];
    const validOrders = ["ASC", "DESC"];
    const validPaginations = [5, 10, 20, 50, 100, 250];

    if (order && !validOrders.includes(order.toUpperCase())) {
        return Promise.reject({ status: 400, msg: "Bad request" });
    }

    if (sortBy && !validSorts.includes(sortBy)) {
        return Promise.reject({ status: 400, msg: "Bad request" });
    }

    if (pageLimit && !validPaginations.includes(parseInt(pageLimit))) {
        return Promise.reject({ status: 400, msg: "Bad request" });
    }

    const sortStr = sortBy ? ` ORDER BY ${sortBy}` : " ORDER BY created_at";
    const orderStr = order ? ` ${order.toUpperCase()}` : " DESC";
    const sortQuery = sortStr + orderStr;
    const limit = pageLimit ? parseInt(pageLimit) : 10;
    const offset = (page - 1) * limit;

    let paginationStr = ` LIMIT $${queryValues.length + 1} OFFSET $${queryValues.length + 2}`;

    if (topic) {
        return db.query(`SELECT slug FROM topics;`)
        .then((topics) => {
            const validTopics = topics.rows.map(({ slug }) => slug);
            if (!validTopics.includes(topic)) {
                return Promise.reject({ status: 400, msg: "Bad request" });
            } 
            selectQuery += " WHERE topic = $1";
            queryValues.push(topic);            
            paginationStr = ` LIMIT $${queryValues.length + 1} OFFSET $${queryValues.length + 2}`
            selectQuery += " GROUP BY articles.article_id" + sortQuery + paginationStr;
            queryValues.push(limit, offset);
            
            const articlesQuery = db.query(selectQuery, queryValues);
            const totalCountQuery = db.query(`SELECT COUNT(*) FROM articles WHERE topic = $1;`, [topic]);
            
            return Promise.all([articlesQuery, totalCountQuery])
        }).then(([articlesResult, totalCountResult]) => {
            const articles = articlesResult.rows.map(article => ({
                ...article,
                comment_count: Number(article.comment_count)
            }))
            const totalCount = parseInt(totalCountResult.rows[0].count)
            return { articles, total_count: totalCount }
        });
    } else {
        selectQuery += " GROUP BY articles.article_id" + sortQuery + paginationStr;
        queryValues.push(limit, offset);

        const articlesQuery = db.query(selectQuery, queryValues);
        const totalCountQuery = db.query(`SELECT COUNT(*) FROM articles;`);
        
        return Promise.all([articlesQuery, totalCountQuery]).then(([articlesResult, totalCountResult]) => {
            const articles = articlesResult.rows.map(article => ({
                ...article,
                comment_count: Number(article.comment_count)
            }))
            const totalCount = parseInt(totalCountResult.rows[0].count)
            return { articles, total_count: totalCount }
        })
    }
};

exports.fetchComments = (article_id, pageLimit, page) => {
    if (isNaN(article_id)) {
        return Promise.reject({ status: 400, msg: "Bad request" });
    }

    const validPaginations = [5, 10, 20, 50, 100, 250]
    
    if (pageLimit && !validPaginations.includes(parseInt(pageLimit))) {
        return Promise.reject({ status: 400, msg: "Bad request" });
    }

    const limit = pageLimit ? parseInt(pageLimit) : 10;
    const offset = (page - 1) * limit;
    const queryValues = [article_id]

    return exports
        .checkExists("articles", "article_id", article_id)
        .then(() => {
            const selectQuery = `SELECT * FROM comments 
                WHERE article_id = $1 
                ORDER BY created_at DESC 
                LIMIT $${queryValues.length + 1} 
                OFFSET $${queryValues.length + 2}`;
            return db.query(selectQuery, [...queryValues, limit, offset]);
        })
        .then((result) => (result.rows.length === 0) ? [] : result.rows);
};

exports.insertComment = (article_id, author, body) => {
    if (!article_id || !author || !body) {
        return Promise.reject({ status: 400, msg: "Bad request" });
    }

    return exports.checkExists("articles", "article_id", article_id)
        .then(() => {
            return exports.checkExists("users", "username", author);
        })
        .then(() => {
            const formattedComment = [article_id, author, body];
            const insertQuery = `INSERT INTO comments (article_id, author, body) VALUES ($1, $2, $3) RETURNING *;`;
            return db.query(insertQuery, formattedComment);
        }).then((result) => {
            return result.rows[0]
        });
};

exports.updateArticleVotes = (article_id, votes) => {
    if (!article_id || !votes) {
        return Promise.reject({ status: 400, msg: "Bad request" });
    }

    return exports
        .checkExists("articles", "article_id", article_id)
        .then(() => {
            return db.query(
                `SELECT votes FROM articles WHERE article_id = $1`,
                [article_id]
            );
        })
        .then((result) => {
            const updatedVotes = result.rows[0].votes + votes;
            return db.query(
                `UPDATE articles SET votes = $1 WHERE article_id = $2 RETURNING *;`,
                [updatedVotes, article_id]
            );
        }).then((result) => {
            return  result.rows[0]
        });
};

exports.removeComment = (comment_id) => {
    if (!comment_id) {
        return Promise.reject({ status: 400, msg: "Bad request" });
    }

    return exports
        .checkExists("comments", "comment_id", comment_id)
        .then(() => {
            return db.query(`DELETE FROM comments WHERE comment_id = $1`, [
                comment_id,
            ]);
        });
};

exports.updateCommentVotes = (comment_id, votes) => {
    if (!comment_id || !votes) {
        return Promise.reject({ status: 400, msg: "Bad request" });
    }

    return exports.checkExists("comments", "comment_id", comment_id)
        .then(() => {
            return db.query(
                `SELECT votes FROM comments WHERE comment_id = $1`,
                [comment_id]
            );
        })
        .then((result) => {
            const updatedVotes = result.rows[0].votes + votes;
            return db
                .query(
                    `UPDATE comments SET votes = $1 WHERE comment_id = $2 RETURNING *;`,
                    [updatedVotes, comment_id]
                )
                .then((result) => {
                    return result.rows[0];
                });
        });
};

exports.postArticle = (author, title, body, topic, image) => {
    if (!author || !title || !body || !topic ||
        typeof author !== "string" ||
        typeof topic !== "string" ||
        typeof title !== "string" ||
        typeof body !== "string"
    ) {
        return Promise.reject({ status: 400, msg: "Bad request" });
    }

    const formattedArticle = [author, title, body, topic];
    let insertQuery = `INSERT INTO articles 
    (author, title, body, topic)
    VALUES ($1, $2, $3, $4) RETURNING *;`;

    if (image) {
        if (typeof image !== 'string') {
            return Promise.reject({ status: 400, msg: "Bad request" });
        }
        formattedArticle.push(image);
        insertQuery = `INSERT INTO articles 
        (author, title, body, topic, article_img_url)
        VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
    }

    return exports
        .checkExists("topics", "slug", topic)
        .then(() => {
            return exports.checkExists("users", "username", author);
        })
        .then(() => {
            return db.query(insertQuery, formattedArticle);
        })
        .then((result) => {
            const article_id = result.rows[0].article_id;
            return exports.fetchArticleById(article_id);
        }).then((result) => {
            const article = {...result}
            article.comment_count = Number(article.comment_count)
            return article
        });
};

exports.removeArticle = (article_id) => {
    if (!article_id) {
        return Promise.reject({ status: 400, msg: "Bad request" });
    }
    return exports.checkExists('articles', 'article_id', article_id).then(() => {
        return db.query(`DELETE FROM articles WHERE article_id = $1`, [article_id])
    })
}
