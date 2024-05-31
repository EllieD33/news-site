const { fetchArticleById, fetchArticles, fetchComments, insertComment, updateArticleVotes, removeComment, updateCommentVotes, postArticle } = require('../models/articles.models')

exports.getArticleById = (req, res, next) => {
    const id = req.params.article_id
    fetchArticleById(id).then((result) => {
        const article = {...result}
        article.comment_count = Number(article.comment_count)
        res.status(200).send({ article });
    }).catch(next);
}

exports.getArticles = (req, res, next) => {
    const { topic, sort_by, order, limit } = req.query
    const page = parseInt(req.query.page) || 1;
    fetchArticles(topic, sort_by, order, limit, page).then((articles) => {
        res.status(200).send(articles);
    }).catch(next);
}

exports.getComments = (req, res, next) => {
    const id = req.params.article_id;
    const limit = req.query.limit;
    const page = parseInt(req.query.page) || 1;

    fetchComments(id, limit, page).then((result) => {
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

    updateArticleVotes(id, votes).then((result) => {
        const article = result.rows[0]
        res.status(200).send({ article });
    }).catch(next);
}

exports.deleteComment = (req, res, next) => {
    const id = req.params.comment_id
    removeComment(id).then(() => {
        res.status(204).send()
    }).catch(next);
}

exports.updateComment = (req, res, next) => {
    const id = req.params.comment_id;
    const votes = req.body.inc_votes;
    updateCommentVotes(id, votes).then((comment) => {
        res.status(200).send({ comment });
    }).catch(next);
}

exports.addArticle = (req, res, next) => {
    author = req.body.author;
    title = req.body.title;
    text = req.body.body;
    topic = req.body.topic;
    image = req.body.article_img_url;
    postArticle(author, title, text, topic, image).then((result) => {
        const article = {...result}
        article.comment_count = Number(article.comment_count)
        res.status(201).send({ article })
    }).catch(next)
}