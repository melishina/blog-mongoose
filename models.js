const mongoose = require ('mongoose');
mongoose.Promise = global.Promise;


const blogPostGoose = mongoose.Schema ({
  autor: {
    name: String
  },
  title: {
    type:String, require:true
  },
  content: String, 
  publishDate{
    type:Date, default: Date.now
  });

blogPostGoose.methods.serialize = function(){
  return {
    id: this._id,
    title:this.title,
    content: this.content,
    author: this.name,
    publishDate: this.publishDate
  };
};
''
 const BlogPosts = mongoose.model ('BlogPosts', blogPostGoose);

module.exports = {BlogPosts};