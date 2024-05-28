const app = require('../app');
const request = require('supertest');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data/index')
const endpoints = require('../endpoints.json');
const articles = require('../db/data/test-data/articles');

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