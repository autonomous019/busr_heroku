module.exports = Poster;

var fs = require('fs');

// Constructor
function Poster(req) {
  // always initialize all instance properties
  this.mode = req.body.mode;
  this.greeting = "Posting"; 
  if(this.mode == 'contact'){
	  this.writeContact(req.body);
  }
  
}

// class methods
Poster.prototype.greetingText = function() {

	if(this.mode == "contact"){
		this.greeting = "Contact Request Submitted";
		//console.log(this.greeting);
		
	} 
	return this.greeting;
	
  
}


Poster.prototype.controlContext = function() {
	
	return this.mode;
	
}

Poster.prototype.writeContact = function(req) {
	
	var contact = fs.createWriteStream('contacts.txt', {'flags': 'a'});
	// use {'flags': 'a'} to append and {'flags': 'w'} to erase and write a new file
	var message = req.message;
	var email = req.email;
	var fname = req.fname;
	var lname = req.lname;
	var str = "email: "+email+" , name: "+fname+" "+lname+ " , message: "+message+ " \n";
	
	contact.write(str);
	
	
	
}

