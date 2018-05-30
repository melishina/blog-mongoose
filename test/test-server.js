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
        expect(res.body.length).to.be.at.least(1);
        const expectedKeys = ['title', 'content', 'author'];
        res.body.forEach(function(item) {
          expect(item).to.be.a('object');
          expect(item).to.include.keys(expectedKeys);
        });
      });
  });


  it('should add a POST', function() {
    const newItem = {title: 'Hellhole Canyon Trail', content: lorem(), author: 'MelMor'};
    return chai.request(app)
      .post('/blog-post')
      .send(newItem)
      .then(function(res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('id', 'title', 'content', 'author');
        expect(res.body.id).to.not.equal(null);
        expect(res.body).to.deep.equal(Object.assign(newItem, {id: res.body.id}));
      });
  });

  it('should update posts on PUT', function() {
    const updateData = {
      name: 'Night Hiking',
      content: lorem(),
      author: 'Grant'
    };

    return chai.request(app)
      .get('/blog-post')
      .then(function(res) {
        updateData.id = res.body[0].id;
        return chai.request(app)
          .put(`/blog-post/${updateData.id}`)
          .send(updateData);
      })
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.deep.equal(updateData);
      });
  });

  it('should delete posts on DELETE', function() {
    return chai.request(app)
      // first have to get so we have an `id` of the post to delete
      .get('/blog-post')
      .then(function(res) {
        return chai.request(app)
          .delete(`/blog-post/${res.body[0].id}`);
      })
      .then(function(res) {
        expect(res).to.have.status(204);
      });
  });
});
