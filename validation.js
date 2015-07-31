// Constructor
function Validation() {
  // always initialize all instance properties
  
}
 
// class methods
Validation.prototype.email = function(email) {

    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\
".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA
-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
	
  
}


Validation.prototype.isEmpty = function(text) {
	
    return (!str || /^\s*$/.test(str));
	
   }
	
}

