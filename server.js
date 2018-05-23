
const express = require('express');
const morgan = require('morgan');

const blogPostRouter = require('./blogPostRouter');
const app = express();

// log the http layer
app.use(morgan('common'));
//load the router and route
app.use('/blog-post', blogPostRouter);

app.listen(process.env.PORT || 8080, () => {
  console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
});
