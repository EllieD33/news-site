const { fetchArticleById, fetchArticles, fetchComments, insertComment, updateVotes, removeComment } = require('../models/articles.models')

exports.getArticleById = (req, res, next) => {
    const id = req.params.article_id
    fetchArticleById(id).then((result) => {
        const article = {...result}
        article.comment_count = Number(article.comment_count)
        res.status(200).send({ article });
    }).catch(next);
}

exports.getArticles = (req, res, next) => {
    const { topic, sort_by, order } = req.query
    fetchArticles(topic, sort_by, order).then((result) => {
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

exports.updateArticle = (req, res, next) => {
    const id = req.params.article_id;
    const votes = req.body.inc_votes;

    updateVotes(id, votes).then((result) => {
        const article = result.rows[0]
        res.status(200).send({ article });
    }).catch(next)
}

exports.deleteComment = (req, res, next) => {
    const id = req.params.comment_id
    removeComment(id).then(() => {
        res.status(204).send()
    }).catch(next)
}