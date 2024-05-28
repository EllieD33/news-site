const { fetchArticleById, fetchArticles, fetchComments } = require('../models/articles.models')

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