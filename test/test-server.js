const chai = require('chai');
const chaiHttp = require('chai-http');
//We import our app, closeServer, and runServer, all exported by server.js
const {app, runServer, closeServer} = require('../server');

const expect = chai.expect;

chai.use(chaiHttp);


describe('Blog posts', function() {

  // Before our tests run, we activate the server. Our `runServer` function returns a promise
  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  it('should list post on GET', function() {
    return chai.request(app)
      .get('/blog-post')
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body.length).to.be.above(0);
        const expectedKeys = ['id', 'title', 'content', 'author','publishDate'];
        res.body.forEach(function(item) {
          expect(item).to.be.a('object');
          expect(item).to.have.all.keys(expectedKeys);
        });
      });
  });


  it('should add a POST', function() {
    const newPost = {title: 'Hellhole Canyon Trail', content: lorem(), author: 'MelMor'};
    const expectedKeys = ['id','publishDate'].concat(Object.keys(newPost));

    return chai.request(app)
      .post('/blog-post')
      .send(newPost)
      .then(function(res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.all.keys(expectedKeys);
        expect(res.body.id).to.equal(newPost.title);
        expect(res.body.id).to.equal(newPost.content);
        expect(res.body.id).to.equal(newPost.author)
      });
  });

  it('should update posts on PUT', function() {
    return chai.request(app)
      .get('/blog-posts')
      .then(function(res) {
        const updatedPost = Object.assign(res.body[0],{
        	name: 'Night Hiking',
      		content: lorem()
      	});
        return chai.request(app)
          .put(`/blog-post/${res.body[0].id}`)
          .send(updatedPost)
	      .then(function(res) {
	       expect(res).to.have.status(204);
	      });
	    });
	});

  it('should delete posts on DELETE', function() {
    return chai.request(app)
      // first have to get so we have an `id` of the post to delete
      .get('/blog-posts')
      .then(function(res) {
        return chai.request(app)
          .delete(`/blog-posts/${res.body[0].id}`);  
          .then(function(res) {
        expect(res).to.have.status(204);
    });
   });
  });
});
