const { selectTopics } = require('../models/topics.models')

exports.getAllTopics = (req, res, next) => {
    selectTopics().then((result) => {
        topics = result.rows
        res.status(200).send({ topics })
    }).catch(next)
}