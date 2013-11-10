var mongoose = require('mongoose');
var async = require('async');

var options = {
  db: { native_parser: true },
  server: { poolSize: 5 },
  keepAlive: true
};
mongoose.connect('mongodb://localhost/test', options);

var Schema = mongoose.Schema;

var userSchema = new Schema({
  name:  String,
  email: String,
  friends: []
},{ collection: 'example' });

var User = mongoose.model('User', userSchema);

var jim = new User({
    name: "James Schubert",
    email: "james.schubert@gmail.com"
});

var friend = new User({
    name: "Someone Else",
    email: "someone.else@example.com"
});

async.waterfall([
   function(done) {
       console.log('Saving Jim!');
       return jim.save(done);
   },
   function(doc, ok, done) {
       if(!ok){
           return done(new Error("Couldn't save Jim"));
       }   

       console.log('Saving friend!');
       return friend.save(done);
   },
   function(doc, ok, done) {
       if(!ok){
           return done(new Error("Couldn't save Jim"));
       }

       console.log('Adding friend to Jim!');
       jim.friends.push(friend._id);
       return jim.save(done);
   }
], function(err) {
    if(err) throw err;
    console.log('Finding user!');
    return User.findById(jim.id, function(err, doc) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(doc);
            process.exit();
        }
    });
});
