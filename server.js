const express = require('express');
const morgan = require('morgan');
const mongoose =  require ('mongoose');
mongoose.Promise = global.Promise;

const {BlogPosts} = require('./models');
const {DATABASE_URL, PORT} = require ('./config');

const app = express();

app.use(morgan('common'));
app.use(express.json());

//GET
app.get ('/posts',(request,response)=> { BlogPosts
    .find()
    .then(posts => {
      response.json(posts.map(posts.serialize()));
    })
    .catch(e =>{
      console.error(e);
      response.status(500).json ({error: 'Something went wrong, Sorry'});
    });
  });

app.get('/posts/:id', (request, response) => {
  BlogPosts
    .findById(request.params.id)
    .then(post => response.json(post.serialize()))
    .catch(e => {
      console.error(e);
      response.status(500).json({ error: 'something went wrong' });
    });
});

//POST
app.post('/posts', (request, response) => {
  const requiredFields = ['title', 'content', 'author'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in request.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return response.status(400).send(message);
    }
  }

  BlogPosts
    .create({
      title: request.body.title,
      content: request.body.content,
      author: request.body.author
    })
    .then(blogPosts => request.status(201).json(blogPosts.serialize()))
    .catch(e => {
      console.error(e);
      response.status(500).json({ error: 'Something went wrong' });
    });

});

//PUT
app.put('/posts/:id', (request, response) => {
  if (!(request.params.id && request.body.id && request.params.id === request.body.id)) {
    response.status(400).json({
      error: 'Request path id and request body id values dont match'
    });
  }

  const updated = {};
  const updateableFields = ['title', 'content', 'author'];
  updateableFields.forEach(field => {
    if (field in request.body) {
      updated[field] = request.body[field];
    }
  });

  BlogPosts
    .findByIdAndUpdate(request.params.id, { $set: updated }, { new: true })
    .then(updatedPost => response.status(204).end())
    .catch(e => response.status(500).json({ message: 'Something went wrong' }));
});

//DELETE
app.delete('/posts/:id', (request, response) => {
  BlogPosts
    .findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).json({ message: 'successfuly deleted' });
    })
    .catch(e => {
      console.error(e);
      response.status(500).json({ error: 'something went wrong' });
    });
});

app.delete('/:id', (request, response) => {
  BlogPosts
    .findByIdAndRemove(request.params.id)
    .then(() => {
      console.log(`Deleted blog post with id \`${request.params.id}\``);
      response.status(204).end();
    });
});

app.use('*', function (request, response) {
  response.status(404).json({ message: 'Not Found' });
});

let server;

// Start the server
function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, e => {
      if (e) {
        return reject(e);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', e => {
          mongoose.disconnect();
          reject(e);
        });
    });
  });
}

// Close the server
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(e => {
        if (e) {
          return reject(e);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(e => console.error(e));
}

module.exports = { runServer, app, closeServer };