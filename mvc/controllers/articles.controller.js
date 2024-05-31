const { fetchArticleById, fetchArticles, fetchComments, insertComment, updateArticleVotes, removeComment, updateCommentVotes, postArticle, removeArticle } = require('../models/articles.models')

exports.getArticleById = (req, res, next) => {
    const { article_id } = req.params;
    fetchArticleById(article_id).then((article) => {        
        res.status(200).send({ article });
    }).catch(next);
}

exports.getArticles = (req, res, next) => {
    const { topic, sort_by, order, limit } = req.query;
    const page = parseInt(req.query.page) || 1;
    fetchArticles(topic, sort_by, order, limit, page).then((articles) => {
        res.status(200).send(articles);
    }).catch(next);
}

exports.getComments = (req, res, next) => {
    const { article_id } = req.params;
    const { limit } = req.query;
    const page = parseInt(req.query.page) || 1;

    fetchComments(article_id, limit, page).then((comments) => {
        res.status(200).send({ comments });
    }).catch(next);
}

exports.addComment = (req, res, next) => {
    const { article_id } = req.params;
    const { username, body } = req.body;

    insertComment(article_id, username, body).then((comment) => {
        res.status(201).send({ comment });
    }).catch(next);
}

exports.updateArticle = (req, res, next) => {
    const { article_id } = req.params;
    const {inc_votes: votes} = req.body;

    updateArticleVotes(article_id, votes).then((article) => {
        res.status(200).send({ article });
    }).catch(next);
}

exports.deleteComment = (req, res, next) => {
    const { comment_id } = req.params;
    removeComment(comment_id).then(() => {
        res.sendStatus(204)
    }).catch(next);
}

exports.updateComment = (req, res, next) => {
    const { comment_id } = req.params;
    const { inc_votes: votes }= req.body;
    updateCommentVotes(comment_id, votes).then((comment) => {
        res.status(200).send({ comment });
    }).catch(next);
}

exports.addArticle = (req, res, next) => {
    const { author, title, body, topic, article_img_url } = req.body
    postArticle(author, title, body, topic, article_img_url).then((article) => {        
        res.status(201).send({ article })
    }).catch(next)
}

exports.deleteArticle = (req, res, next) => {
    const { article_id } = req.params
    removeArticle(article_id).then(() => {
        res.sendStatus(204)
    }).catch(next)
}