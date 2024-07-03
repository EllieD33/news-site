# News API

## Project description
Welcome to my Northcoders News API, a RESTful service inspired by the functionality of Reddit! This project serves up articles, users, topics, and comments in JSON format, providing endpoints for CRUD operations. Built using Node.js, Express, and PostgreSQL, this API mimics a real-world backend news service, offering data programmatically for seamless integration with frontend architectures. With endpoints for fetching, posting, patching, and deleting key information from articles, this project showcases my expertise in JavaScript, Node.js, Express, PostgreSQL, and Git for version control.

## Demo
The API is hosted using Supabase and Render here: https://news-site-qstq.onrender.com

It may take a while for the API to connect initially - please be patient :) 

### Overview of endpoints
GET /api


GET /api/topics

POST /api/topics


GET /api/articles

POST /api/articles


GET /api/articles/:article_id

PATCH /api/articles/:article_id

DELETE /api/articles/:article_id


GET /api/articles/:article_id/comments

POST /api/articles/:article_id/comments


PATCH /api/comments/:comment_id

DELETE /api/comments/:comment_id


GET /api/users

GET /api/users/:username


You can go to the /api endpoint to view more detailed descriptions of available endpoints.

## Getting started

Follow these steps to set up and run the project locally.

### Prerequisites
Ensure you have the following installed:

 - Node.js 
 - Postgres 

### Clone the repository
Fork and clone the repo

```git clone https://github.com/YourUsername/news-site.git```


### Install dependencies

```npm install```

### Create environment variables
To successfully clone and run this project locally, you will need to manually create the environment variables.

#### Create `.env.development`
In the root of the project directory, create a file named `.env.development` and add the following:

```PGDATABASE=nc_news```

#### Create `.env.test`
In the root of the project directory, create a file named `.env.test`

```PGDATABASE=nc_news_test```

### Set up local database
Ensure you have Postgres running locally, then run the script to set up the databases:

```npm run setup-dbs```

Next, seed the database:

```npm run seed```

### Run the tests
The API was built using test driven development (TDD). You can run the tests to ensure everything is working as expected:

```npm test```


--- 

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)