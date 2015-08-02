//var redis = require("redis"), client = redis.createClient(); #deprecated for heroku

//heroku code requirements
var redis = require('redis');
var url = require('url');
var redisURL = url.parse(process.env.REDISCLOUD_URL);
var client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
client.auth(redisURL.auth.split(":")[1]);
// end heroku

client.on("error", function (err) {
    console.log("Error " + err);
});

var routes = new Array();
var my_route_arr = new Array();
var route_maps =  new Array();

exports.setRouteMap = function(agency_name) {
	
    if(route_maps.length >= 1){
    	 route_maps.length = 0;
    }

	var i = 0;	
	
	//get all route ids for an agency
	client.get(agency_name+':system_coords_length', function(err,sys_len) {
 	   if (err) {
              var map_len = 0;
 	      } else {
			  var map_len = sys_len;
			  console.log(map_len);
			  
			  for(var x = 0; x<map_len; x++){
				  
  		  	    client.lindex(agency_name+':system_coords', x, function(err,route_map_ids) {
	
		
  		  		   if (err) {
          
  		  		  		my_coords_arr += [{"route_map_id":"404: error, no data"}];

  		  		      } else {
			  
  		  			  	      var k = 0;
  		  					  var route_params = route_map_ids.split(" ");
  		  					  var shape_id = route_params[0];
  		  					  var shape_sequence = route_params[1];
 
  		  			  		client.hgetall(agency_name+':shapes_'+shape_id+'_'+shape_sequence, function(err, results) {
			
  		  			  		   if (err) {
		          
  		  			  		  		my_coords_arr += [{"agency_id":"404: error, no data", "agency_url":"sorry, temporary error"}];

  		  			  		      } else {
				  
  		  			  				 my_coords_arr = results;
  		  			  				 route_maps.push(my_coords_arr);
				 
  		  			  				 if(k == route_map_ids.length-1){
							 
  		  			  					 console.log(route_maps);
  		  			  					 return route_maps;
  		  			  				 } 

  		  			  		     }
  		  			  			  k++;
  		  			  		});

		
  		  		  }
  		  		});	
		
				  
			  }
		  }
	
		  
	
	  });
	  
	  
	 
    

};







exports.getRouteMap = function(agency_name) {
	this.setRouteMap(agency_name);
	
	return route_maps;

};