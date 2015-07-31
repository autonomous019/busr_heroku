// Constructor
function Validator() {
  // always initialize all instance properties
  
}
 
// class methods
Validator.prototype.email = function(email) {

    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\
".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA
-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);	
  
}

Validator.prototype.isEmpty = function(str) {
	
    return (!str || /^\s*$/.test(str));
	
   }
	
}

Validator();