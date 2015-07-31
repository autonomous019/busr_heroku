var redis = require("redis"), client = redis.createClient();

client.on("error", function (err) {
    console.log("Error " + err);
});

var my_arr = new Array();
var my_detail_arr = new Array();
var my_routes_arr = new Array();
var agencies = [ ];
var agent_info = [ ];
var agent = [ ];
var routes = [ ];

exports.getAgencies = function() {
    //if(agencies.length >= 1){
    //	return agencies;
    //}
    if(agencies.length >= 1){
    	 agencies.length = 0;
    }

    client.smembers('agencies', function(err, keys) {

    if (err) return console.log(err);
  
    for(var i = 0, len = keys.length; i < len; i++) {
		var k = 0;
		keys[i] = "agency:"+keys[i];
		client.hgetall(keys[i], function(err, results) {
			
		   if (err) {
		          
		  		my_arr += [{"agency_id":"404: error, no data", "agency_url":"sorry, temporary error"}];

		      } else {
				  
				 my_arr = results;
				 agencies.push(my_arr);
				 
				 if(k == keys.length-1){
					 console.log(agencies);
					 return agencies;
				 } 

		     }
			  k++;
		});
    }
   });

};



 

 exports.getAgenciesStatic = function() {
	 //this.getAgencies();
 	return agencies;
 }


 exports.getAgency = function(agency_name) {
     if(agent.length >= 1){
     	agent = [];
     }
	 client.hgetall("agency:"+agency_name, function(err, results) {
		
	   if (err) {
	          
	  		agent = [{"agency_name":"404: error, no data", "agency_id":"sorry, temporary error"}];
            return results;
	      } else {
			  
			 my_detail_arr = results;
			 agent.push(my_detail_arr);
			 
			 return agent;

	      }
		  k++;
	});
 }
 
 exports.getAgencyStatic = function() {
 	return agent;
 }



 //"Intercity_Transit:route_10" Intercity_Transit_routes
 exports.getAgencyRoutes = function(agency_name) {
     if(routes.length >= 1){
     	routes = [];
     }
     
     client.smembers(agency_name+'_routes', function(err, keys) {

     if (err) return console.log(err);
  
     for(var i = 0, len = keys.length; i < len; i++) {
 		var k = 0;
		
 		keys[i] = agency_name+':route_'+keys[i];
		
 		client.hgetall(keys[i], function(err, results) {
			
 		   if (err) {
		          
 		  		my_route_arr += [{"route_id":"404: error, no data"}];

 		      } else {
				  
 				 my_route_arr = results;
				 my_route_arr['route_agency_id'] = agency_name;
				 /*
				 route_short_name: '609',
				   route_long_name: 'Tumwater/Lakewood',
				 */
				 //console.log(results);
				 //console.log("agency id "+my_route_arr['route_agency_id']);
 				 routes.push(my_route_arr);
				 
 				 if(k == keys.length-1){
                    //console.log(routes);
 					 return routes;
 				 } 

 		      }
 			  k++;
 		});
     }
    });

 };
 
 exports.getAgencyRoutesStatic = function() {
 	return routes;
 }




 
 
