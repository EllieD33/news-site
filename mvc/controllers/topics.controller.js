const { selectTopics, postNewTopic } = require('../models/topics.models')

exports.getAllTopics = (req, res, next) => {
    selectTopics().then((topics) => {
        res.status(200).send({ topics })
    }).catch(next)
}

exports.addTopic = (req, res, next) => {
    const { slug, description } = req.body
    postNewTopic(slug, description).then((topic) => {
        res.status(201).send({ topic })
    }).catch(next)
}