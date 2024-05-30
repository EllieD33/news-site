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
                    article_img_url: expect.any(String),
                    comment_count: expect.any(Number),
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
                expect(response.body.articles.length).toBe(10);
                response.body.articles.forEach((article) => {
                    expect(article).toEqual(expect.objectContaining({
                        article_id: expect.any(Number),
                        author: expect.any(String),
                        title: expect.any(String),
                        topic: expect.any(String),
                        created_at: expect.any(String),
                        article_img_url: expect.any(String),
                        votes: expect.any(Number),
                        comment_count: expect.any(Number)
                    }))
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
    test('POST:201 inserts new article and serves new article object', () => {
        return request(app)
            .post('/api/articles')
            .send({
                author: 'butter_bridge',
                title: 'Dogs are superior to cats',
                body: 'And golden retrievers are the best and cutest doggos ever, FACT! They are dopey and cute and clever and gentle and endlessly loyal. They are the Peter Pans of dogs - goofballs that never grow up. Tell me, what more could you want from a dog?',
                topic: 'cats',
                article_img_url: 'https://www.rover.com/blog/wp-content/uploads/2021/06/denvers_golden_life-1024x1024.jpg'
            })
            .expect(201)
            .then((response) => {
                expect(response.body.article).toEqual(expect.objectContaining({
                    article_id: expect.any(Number),
                    author: expect.any(String),
                    title: expect.any(String),
                    body: expect.any(String),
                    topic: expect.any(String),
                    created_at: expect.any(String),
                    article_img_url: expect.any(String),
                    votes: expect.any(Number),
                    comment_count: expect.any(Number)
                }))
            })
    });
    test('POST:201 adds default image url if none provided', () => {
        return request(app)
            .post('/api/articles')
            .send({
                author: 'butter_bridge',
                title: 'Dogs are superior to cats',
                body: 'And golden retrievers are the best and cutest doggos ever, FACT! They are dopey and cute and clever and gentle and endlessly loyal. They are the Peter Pans of dogs - goofballs that never grow up. Tell me, what more could you want from a dog?',
                topic: 'cats',
            })
            .expect(201)
            .then((response) => {
                expect(response.body.article).toHaveProperty('article_img_url', 'https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700')
            })
    });
    test('POST:400 responds with error if one or more required fields is missing', () => {
        return request(app)
            .post('/api/articles')
            .send({
                author: 'butter_bridge',
                title: 'Dogs are superior to cats',
            })
            .expect(400)
            .then((response) => {
                expect(response.body.msg).toBe('Bad request')
            })
    });
    test('POST:400 responds with error if one or more required fields contains invalid data types', () => {
        return request(app)
            .post('/api/articles')
            .send({
                author: 'butter_bridge',
                title: 256,
                body: 'And golden retrievers are the best and cutest doggos ever, FACT! They are dopey and cute and clever and gentle and endlessly loyal. They are the Peter Pans of dogs - goofballs that never grow up. Tell me, what more could you want from a dog?',
                topic: 'cats',
            })
            .expect(400)
            .then((response) => {
                expect(response.body.msg).toBe('Bad request')
            })
    });
    test('POST:404 responds with error if references values dont exist', () => {
        return request(app)
            .post('/api/articles')
            .send({
                author: 'not-here',
                title: 'Dogs are superior to cats',
                body: 'And golden retrievers are the best and cutest doggos ever, FACT! They are dopey and cute and clever and gentle and endlessly loyal. They are the Peter Pans of dogs - goofballs that never grow up. Tell me, what more could you want from a dog?',
                topic: 'cats',
            })
            .expect(404)
            .then((response) => {
                expect(response.body.msg).toBe('Not found')
            })
    });
    describe('/api/articles filter query', () => {
        test('GET:200 filters the articles by the topic value specified in the query', () => {
            return request(app)
                .get('/api/articles?topic=cats')
                .expect(200)
                .then((response) => {
                    response.body.articles.forEach((article) => {
                        expect(article.topic).toBe('cats')
                    })
                })
        });
        test('GET:400 responds with error when given non-existent topic in query', () => {
            return request(app)
                .get('/api/articles?topic=spiders')
                .expect(400)
                .then((response) => {
                    expect(response.body.msg).toBe('Bad request');
                })
        });
        test('GET:200 responds with an empty array when topic exists but has no associated articles', () => {
            return request(app)
                .get('/api/articles?topic=paper')
                .expect(200)
                .then((response) => {
                    expect(response.body.articles).toEqual([]);
                })
        });
    });
    describe('/api/articles sort and order queries', () => {
        test('GET:200 sorts by given column in desc order when no order specified', () => {
            return request(app)
            .get('/api/articles?sort_by=title')
            .expect(200)
            .then((response) => {
                expect(response.body.articles).toBeSortedBy('title', { descending: true})
            })
        });
        test('GET:200 sorts by given column in asc order', () => {
            return request(app)
            .get('/api/articles?sort_by=author&order=asc')
            .expect(200)
            .then((response) => {
                expect(response.body.articles).toBeSortedBy('author')
            })
        });
        test('GET:200 sorts by given column in desc order', () => {
            return request(app)
            .get('/api/articles?sort_by=comment_count&order=desc')
            .expect(200)
            .then((response) => {
                expect(response.body.articles).toBeSortedBy('comment_count', { descending: true})
            })
        });
        test('GET:400 responds with error message when passed invalid sort query', () => {
            return request(app)
                .get('/api/articles?sort_by=monkey')
                .expect(400)
                .then((response) => {
                    expect(response.body.msg).toBe('Bad request');
                })
        });
        test('GET:400 responds with error message when passed invalid sort query', () => {
            return request(app)
                .get('/api/articles?sort_by=title&order=cats')
                .expect(400)
                .then((response) => {
                    expect(response.body.msg).toBe('Bad request');
                })
        });
    });
    describe('/api/article pagination queries', () => {
        test('GET:200 limits responses to specified number of results per page', () => {
            return request(app)
            .get('/api/articles?limit=5')
            .expect(200)
            .then((response) => {
                expect(response.body.articles.length).toBe(5)
            })
        });
        test('GET:400 responds with error if invalid pagination limit provided', () => {
            return request(app)
            .get('/api/articles?limit=7')
            .expect(400)
            .then((response) => {
                expect(response.body.msg).toBe('Bad request')
            })
        });
        test('GET:200 goes to specified page of results', () => {
            return request(app)
            .get('/api/articles?limit=10&page=2')
            .expect(200)
            .then((response) => {
                expect(response.body.articles.length).toBe(3)
            });
        });
        test('GET:200 chains successfully onto other queries', () => {
            return request(app)
            .get('/api/articles?topic=mitch&limit=5&page=2')
            .expect(200)
            .then((response) => {
                expect(response.body.articles.length).toBe(5);
                response.body.articles.forEach((article) => {
                    expect(article.topic).toBe('mitch');
                });
            });
        });
        test('GET:200 adds total results count to served object', () => {
            return request(app)
            .get('/api/articles?topic=mitch')
            .expect(200)
            .then((response) => {
                expect(response.body).toHaveProperty('total_count')
            })
        });
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
                    votes: 0,
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

describe('/api/comments/:comment_id', () => {
    test('DELETE:204  deletes the specified comment and sends no body back', () => {
        return request(app).delete('/api/comments/1').expect(204);
    });
    test('DELETE:400 responds with an appropriate status and error message when given an invalid id', () => {
        return request(app)
        .delete('/api/comments/twenty')
        .expect(400)
        .then((response) => {
            expect(response.body.msg).toBe("Bad request");
        })
    });
    test('DELETE:404 responds with an appropriate status and error message when given a non-existent id', () => {
        return request(app)
        .delete('/api/comments/100000')
        .expect(404)
        .then((response) => {
            expect(response.body.msg).toBe("Not found");
        })
    });
    test('PATCH:200 increments comment votes by given amount and responds with updated comment', () => {
        return request(app)
        .patch('/api/comments/1')
        .send({ inc_votes : 1 })
        .expect(200)
        .then((response) => {
            expect(response.body.comment).toEqual(expect.objectContaining({
                comment_id: 1,
                body: expect.any(String),
                votes: 17,
                author: expect.any(String),
                article_id: expect.any(Number),
                created_at: expect.any(String),
            }))
        })
    });
    test('PATCH:200 decrements comment votes by given amount and responds with updated comment', () => {
        return request(app)
        .patch('/api/comments/1')
        .send({ inc_votes : -10 })
        .expect(200)
        .then((response) => {
            expect(response.body.comment).toEqual(expect.objectContaining({
                comment_id: 1,
                body: expect.any(String),
                votes: 6,
                author: expect.any(String),
                article_id: expect.any(Number),
                created_at: expect.any(String),
            }))
        })
    });
    test('PATCH:400 responds with error if comment id invalid', () => {
        return request(app)
        .patch('/api/comments/twenty')
        .send({ inc_votes : -10 })
        .expect(400)
        .then((response) => {
            expect(response.body.msg).toBe('Bad request')
        })
    });
    test('PATCH:400 responds with error if body data invalid', () => {
        return request(app)
        .patch('/api/comments/1')
        .send({ inc_votes : 'ten' })
        .expect(400)
        .then((response) => {
            expect(response.body.msg).toBe('Bad request')
        })
    });
    test('PATCH:400 responds with error if body data missing', () => {
        return request(app)
        .patch('/api/comments/1')
        .send({ })
        .expect(400)
        .then((response) => {
            expect(response.body.msg).toBe('Bad request')
        })
    });
    test('PATCH:404 responds with error if comment doesnt exist', () => {
        return request(app)
        .patch('/api/comments/11111111')
        .send({ inc_votes : 10 })
        .expect(404)
        .then((response) => {
            expect(response.body.msg).toBe('Not found')
        })
    });
});

describe('/api/users', () => {
    test('GET:200 responds with an array of user objects', () => {
        return request(app)
            .get('/api/users')
            .expect(200)
            .then((response) => {
                expect(response.body.users.length).toBe(4);
                response.body.users.forEach((user) => {
                    expect(user).toEqual(expect.objectContaining({
                        username: expect.any(String),
                        name: expect.any(String),
                        avatar_url: expect.any(String)
                    }))
                })
            })
    });
});

describe('/api/users/:username', () => {
    test('GET:200 responds with specified user object', () => {
        return request(app)
            .get('/api/users/lurker')
            .expect(200)
            .then((response) => {
                expect(response.body.user).toEqual(expect.objectContaining({
                    username: 'lurker',
                    name: 'do_nothing',
                    avatar_url: 'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png'
                }))
            })
    });
    test('GET:404 responds with error is username doesnt exist', () => {
        return request(app)
            .get('/api/users/idontexist')
            .expect(404)
            .then((response) => {
                expect(response.body.msg).toBe('Not found');
            })
    });
});