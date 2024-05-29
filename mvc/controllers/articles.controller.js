const { fetchArticleById, fetchArticles, fetchComments, insertComment } = require('../models/articles.models')

exports.getArticleById = (req, res, next) => {
    const id = req.params.article_id
    fetchArticleById(id).then((result) => {
        const article = result
        res.status(200).send({ article });
    }).catch(next);
}

exports.getArticles = (req, res, next) => {
    fetchArticles().then((result) => {
        const articles = result.rows.map(article => ({
            ...article,
            comment_count: Number(article.comment_count)
        }))
        res.status(200).send({ articles });
    }).catch(next);
}

exports.getComments = (req, res, next) => {
    const id = req.params.article_id;
    fetchComments(id).then((result) => {
        const comments = result
        res.status(200).send({ comments });
    }).catch(next);
}

exports.addComment = (req, res, next) => {
    const id = req.params.article_id;
    const username = req.body.username;
    const comment = req.body.body;

    insertComment(id, username, comment).then((result) => {
        const comment = result.rows[0]
        res.status(201).send({ comment });
    }).catch(next);
}