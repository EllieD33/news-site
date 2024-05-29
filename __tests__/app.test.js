const app = require('../app');
const request = require('supertest');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data/index')
const endpoints = require('../endpoints.json');

beforeEach(() => seed(data));
afterAll(() => db.end());

describe('/api/topics', () => {
    test('GET:200 sends an array of topic objects to the client', () => {
        return request(app)
            .get('/api/topics')
            .expect(200)
            .then((response)=> {
                expect(response.body.topics.length).toBe(3);
                response.body.topics.forEach((topic) => {
                    expect(topic).toHaveProperty('description', expect.any(String));
                    expect(topic).toHaveProperty('slug', expect.any(String));
                })
            }) 
    });
});

describe('/api', () => {
    test('GET:200 responds with object describing all the available endpoints', () => {
        return request(app)
            .get('/api')
            .expect(200)
            .then((response) => {
                expect(response.body.endpoints).toEqual(endpoints);
            });
    });
});

describe('/api/articles/:article_id', () => {
    test('GET:200 responds with an article object ', () => {
        return request(app)
            .get('/api/articles/5')
            .expect(200)
            .then((response) => {
                expect(response.body.article.article_id).toBe(5)
                expect(response.body.article).toEqual(expect.objectContaining({
                    article_id: expect.any(Number),
                    author: expect.any(String),
                    title: expect.any(String),
                    topic: expect.any(String),
                    body: expect.any(String),
                    created_at: expect.any(String),
                    votes: expect.any(Number),
                    article_img_url: expect.any(String)
                }))
            })
    });
    test('GET:404 responds with error message when id does not exist', () => {
        return request(app)
            .get('/api/articles/9999')
            .expect(404)
            .then((response) => {
                expect(response.body.msg).toBe('Not found');
            })
    });
    test('GET:400 responds with error when given invalid id', () => {
        return request(app)
            .get('/api/articles/twenty')
            .expect(400)
            .then((response) => {
                expect(response.body.msg).toBe('Bad request');
            })
    });
    test('PATCH:200 increments article votes by given amount and responds with updated article', () => {
        return request(app)
        .patch('/api/articles/5')
        .send({ inc_votes: 1 })
        .expect(200)
        .then((response) => {
            expect(response.body.article).toEqual(expect.objectContaining({
                article_id: 5,
                author: expect.any(String),
                title: expect.any(String),
                topic: expect.any(String),
                body: expect.any(String),
                created_at: expect.any(String),
                votes: 1,
                article_img_url: expect.any(String)
            }))
        })
    });
    test('PATCH:200 decrements article votes by given amount and responds with updated article', () => {
        return request(app)
        .patch('/api/articles/5')
        .send({ inc_votes: -100 })
        .expect(200)
        .then((response) => {
            expect(response.body.article).toEqual(expect.objectContaining({
                article_id: 5,
                author: expect.any(String),
                title: expect.any(String),
                topic: expect.any(String),
                body: expect.any(String),
                created_at: expect.any(String),
                votes: -100,
                article_img_url: expect.any(String)
            }))
        })
    });
    test('PATCH:400 responds with error message when request body invalid', () => {
        return request(app)
        .patch('/api/articles/5')
        .send({ inc_votes: 'twenty' })
        .expect(400)
        .then((response) => {
            expect(response.body.msg).toBe('Bad request')
        })
    });
    test('PATCH:400 responds with error message when request body missing', () => {
        return request(app)
        .patch('/api/articles/5')
        .send({})
        .expect(400)
        .then((response) => {
            expect(response.body.msg).toBe('Bad request')
        })
    });
    test('PATCH:404 responds with error message when article id does not exist', () => {
        return request(app)
        .patch('/api/articles/555555')
        .send({ inc_votes: -100 })
        .expect(404)
        .then((response) => {
            expect(response.body.msg).toBe('Not found')
        })
    });
    test('PATCH:400 responds with error message when article id invalid', () => {
        return request(app)
        .patch('/api/articles/yoyoyo')
        .send({ inc_votes: -100 })
        .expect(400)
        .then((response) => {
            expect(response.body.msg).toBe('Bad request')
        })
    });
});

describe('/api/articles', () => {
    test('GET:200 responds with an articles array of article objects', () => {
        return request(app)
            .get('/api/articles')
            .expect(200)
            .then((response) => {
                expect(response.body.articles.length).toBe(13);
                response.body.articles.forEach((article) => {
                    expect(article).toEqual({
                        article_id: expect.any(Number),
                        author: expect.any(String),
                        title: expect.any(String),
                        topic: expect.any(String),
                        created_at: expect.any(String),
                        article_img_url: expect.any(String),
                        votes: expect.any(Number),
                        comment_count: expect.any(Number)
                    })
                })
            })
    });
    test('GET:200 served array is sorted by date in descending order by default', () => {
        return request(app)
            .get('/api/articles')
            .expect(200)
            .then((response) => {
                expect(response.body.articles).toBeSortedBy('created_at', { descending: true})
            })
    });
    test('GET:200 correctly counts comments', () => {
        return request(app)
            .get('/api/articles')
            .expect(200)
            .then((response) => {
                expect(response.body.articles[7].comment_count).toBe(2)
                expect(response.body.articles[9].comment_count).toBe(0)
            })
    });
});

describe('/api/articles/:article_id/comments', () => {
    test('GET:200 responds with an array of comments for the given article_id', () => {
        return request(app)
            .get('/api/articles/9/comments')
            .expect(200)
            .then((response) => {
                expect(response.body.comments.length).toBe(2);
                response.body.comments.forEach((comment) => {
                    expect(comment).toEqual(expect.objectContaining({
                        comment_id: expect.any(Number),
                        votes: expect.any(Number),
                        created_at: expect.any(String),
                        author: expect.any(String),
                        body: expect.any(String),
                        article_id: 9
                    }))
                })
            })
    });
    test('GET:200 comments served with most recent first', () => {
        return request(app)
            .get('/api/articles/9/comments')
            .expect(200)
            .then((response) => {
                expect(response.body.comments).toBeSortedBy('created_at', { descending: true})
            })
    });
    test('GET:404 responds with error message when id does not exist', () => {
        return request(app)
            .get('/api/articles/9999/comments')
            .expect(404)
            .then((response) => {
                expect(response.body.msg).toBe('Not found');
            })
    });
    test('GET:400 responds with error when given invalid id', () => {
        return request(app)
            .get('/api/articles/twenty/comments')
            .expect(400)
            .then((response) => {
                expect(response.body.msg).toBe('Bad request');
            })
    });
    test('GET:200 responds with empty array when no comments', () => {
        return request(app)
            .get('/api/articles/8/comments')
            .expect(200)
            .then((response) => {
                expect(response.body.comments).toEqual([]);
            })
    });
    test('POST:201 responds with the posted comment', () => {
        return request(app)
            .post('/api/articles/8/comments')
            .send({
                username: 'rogersop',
                body: 'yeah right'
            })
            .expect(201)
            .then((response) => {
                expect(response.body.comment).toEqual(expect.objectContaining({
                    comment_id: expect.any(Number),
                    created_at: expect.any(String),
                    author: 'rogersop',
                    body: 'yeah right',
                    article_id: 8
                }))
            })
    });
    test('POST:400 send error when required data not included in body', () => {
        return request(app)
            .post("/api/articles/8/comments")
            .send({
                body: 'no way'
            })
            .expect(400)
            .then((response) => {
                expect(response.body.msg).toBe("Bad request");
            });
    });
    test('POST:404 returns error message when username doesnt exist',() => {
        return request(app)
            .post('/api/articles/8/comments')
            .send({
                username: 'idontexist',
                body: 'yeah right'
            })
            .expect(404)
            .then((response) => {
                expect(response.body.msg).toBe("Not found");
            });
    })
    test('POST:404 returns error message when article doesnt exist',() => {
        return request(app)
            .post('/api/articles/88888/comments')
            .send({
                username: 'rogersop',
                body: 'yeah right'
            })
            .expect(404)
            .then((response) => {
                expect(response.body.msg).toBe("Not found");
            });
    })
    test('POST:400 returns error message when article id invalid',() => {
        return request(app)
            .post('/api/articles/notright/comments')
            .send({
                username: 'rogersop',
                body: 'yeah right'
            })
            .expect(400)
            .then((response) => {
                expect(response.body.msg).toBe("Bad request");
            });
    })
});