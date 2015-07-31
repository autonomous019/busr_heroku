var redis = require("redis"),
     client = redis.createClient();

client.on("error", function (err) {
    console.log("Error " + err);
});

var my_arr = new Array();
var my_detail_arr = new Array();
var my_stops_arr = new Array();
var stops = [ ];
var stops_info = [ ];
var stop = [ ];
var trips = [ ];

exports.compileStops = function(route_id) {
    if(agencies.length >= 1){
    	return stops;
    }
    //create a set based on each route and gather stops for that route and trips for the route
    client.smembers(route_id+'_stops_to_routes', function(err, keys) {

    if (err) return console.log(err);
  
    for(var i = 0, len = keys.length; i < len; i++) {
		var k = 0;
		keys[i] = "agency:"+keys[i];
		client.hgetall(keys[i], function(err, results) {
			
		   if (err) {
		          
		  		my_arr += [{"route_id":"404: error, no data"}];

		      } else {
				  
				 my_arr = results;
				 stops.push(my_arr);
				 
				 if(k == keys.length-1){
                    
					 return stops;
				 } 

		     }
			 k++;
		});
    }
   });

};


exports.getStopsStatic = function() {
	return stops;

};



 
