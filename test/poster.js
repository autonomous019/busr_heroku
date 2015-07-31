var should = require('should');
var poster = require('../poster');
//run '>npm test' to start tests, auto watching is on



//testing properties on Poster class
describe('Poster', function() {
  it('should have mode and greeting', function(done) {
	  poster.greeting = "hello";
	  poster.mode="contact";
      var poster_mode = poster.mode;
	  var poster_greeting = poster.greeting;
      poster_mode.should.equal('contact');
	  poster_greeting.should.equal('hello');
	  done();  //always call done so mocha knows test is complete
  });
  
  //testing for whether a file is updated upon contact submission
  
  
  
  
  
});


/*

 req body: 
   { fname: 'wefs',
     lname: 'dsfd',
     email: 'sdfd',
     mode: 'contact',
     message: 'sdf' },

*/