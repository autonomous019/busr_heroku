//var redis = require("redis"), client = redis.createClient(); #deprecated for heroku

//heroku code requirements
var redis = require('redis');
var url = require('url');
var redisURL = url.parse(process.env.REDISCLOUD_URL);
var client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
client.auth(redisURL.auth.split(":")[1]);
// end heroku


var my_arr = new Array();
var stops =  new Array();

var my_route_arr = new Array();
var route_maps =  new Array();
var shape_keys =  new Array();

var my_schedule_arr = new Array();
var schedules =  new Array();

var my_transfers_arr = new Array();
var transfers =  new Array();
var my_trans_route_arr = new Array();
var trans_route_maps =  new Array();
var trans_shape_keys =  new Array();

var transfer_markers = new Array();
var my_trans_markers = new Array();

realbus = new Array();
get_realbus = new Array();
route_center = "";
route_box = "";
module.exports.myCenter = "";

//STOPS
exports.setStops = function(route_id, agency_name) {
	
    if(stops.length >= 1){
    	 stops.length = 0;
    }

	var i = 0;	

    client.smembers(agency_name+'_stops_to_route_'+route_id, function(err,stop_ids) {

	
	   if (err) {
          
	  		my_arr += [{"stop_id":"404: error, no data"}];

	      } else {
			  
			  i++;
			  for(var i = 0, len = stop_ids.length; i < len; i++) {  
		  	      var k = 0;

		  		client.hgetall(agency_name+':stop_'+stop_ids[i], function(err, results) {
			
		  		   if (err) {
		          
		  		  		my_arr += [{"agency_id":"404: error, no data", "agency_url":"sorry, temporary error"}];

		  		      } else {
				  
		  				 my_arr = results;
		  				 stops.push(my_arr);
				 
		  				 if(k == stop_ids.length-1){

		  					 return stops;
		  				 } 

		  		     }
		  			  k++;
		  		});
	
	     }
	  }
	});	

};




exports.getStops = function(route_id, agency_name) {
	this.setStops(route_id, agency_name);
	
	return stops;

};



exports.setRouteMap = function(route_id, agency_name) {
	
    if(route_maps.length >= 1){
    	 route_maps.length = 0;
    }

	var i = 0;	
	
	client.get(agency_name+':route_shapes_length_'+route_id, function(err,rs_len) {
 	   if (err) {
                 var rs_length = 0;
 	      } else {
			
			  var rs_length = rs_len;

		  	for(var c = 0; c < rs_length; c++ ){
				
		  	    client.lindex(agency_name+':route_shapes_'+route_id, c, function(err,route_map_ids) {
		
		  		   if (err) {
          
		  		  		my_route_arr += [{"route_map_id":"404: error, no data"}];

		  		      } else {
			  
		  			  	      var k = 0;
	
		  					  var route_params = route_map_ids.split(" ");
		  					  var shape_id = route_params[0];
		  					  var shape_sequence = route_params[1];
		  					  shape_keys.push(shape_id+'_'+shape_sequence);

		  			  		  client.hgetall(agency_name+':shapes_'+shape_id+'_'+shape_sequence, function(err, results) {
			
		  			  		   if (err) {
		          
		  			  		  		my_route_arr += [{"agency_id":"404: error, no data", "agency_url":"sorry, temporary error"}];

		  			  		      } else {
				  
		  			  				 my_route_arr = results;
		  			  				 route_maps.push(my_route_arr);
				 
		  			  				 if(k == route_map_ids.length-1){
							 
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


exports.getRouteMap = function(route_id, agency_name) {
	this.setRouteMap(route_id, agency_name);
	
	return route_maps;

};




//Schedules
exports.setSchedules = function(route_id, agency_name) {
	//need to get route schedule lengths then iterate through lindexes per length
	
    if(schedules.length >= 1){
    	 schedules.length = 0;
    }
    var cnt = 0;
	
	client.get(agency_name+':route_schedule_length_'+route_id, function(err,sched_len){
	     console.log("sched len:" + sched_len);
		 schedule_len = sched_len;	
		 
	  	for(var c = 0; c < schedule_len; c++ ){
			 var k = 0;
	  	    client.lindex(agency_name+':route_schedule_'+route_id, c, function(err, sched) {

	  		   if (err) {
       
	  		  		my_route_arr += [{"route_map_id":"404: error, no data"}];

	  		      } else {
		                
	  					  var route_params = sched.split(" ");
						  trip_id = route_params[0];
						  stop_id = route_params[1];
						  arrival_time = route_params[2];
						  sequencer = route_params[3];
						  distance_from_head = route_params[4];
						  days = route_params[5];
						  trip_headsign = route_params[6];
						  block_id = route_params[7];
						  service_id = route_params[8];
						  
						  var data_arr = new Array();
						  data_arr['trip_id'] = trip_id;
						  data_arr['stop_id'] = stop_id;
						  data_arr['arrival_time'] = arrival_time;
						  data_arr['sequencer'] = sequencer;
						  data_arr['distance_from_head'] = distance_from_head;
						  data_arr['days'] = days;
 					      data_arr['trip_headsign'] = trip_headsign;
 					      data_arr['block_id'] = block_id;
 					      data_arr['service_id'] = service_id;
						  
						  schedules.push(data_arr);
						  
						  if(cnt === schedule_len-1){
						  	//console.log(schedules);
							return schedules;
						  }
						  cnt++;
						  
					      //TODO when adding atomized stop schedules use this:	  
						  //@redis.SADD(@agency_name+"_stop_schedule_"+c['stop_id'], c['trip_id'].to_s+" "+c['arrival_time'].to_s+" "+c['departure_time'])
						
						
	  		  }
	  		});	
	  	}
	});
};




exports.getSchedules = function(route_id, agency_name) {
	this.setSchedules(route_id, agency_name);
	
	return schedules;

};




exports.setRealBus = function(route_short_name){	
    var request = require('request');
    
	proc_realtime = request.get('http://www.intercitytransit.com/rtacs/busdata.txt', function (error, response, body) {
        
		realbus = [];
		realbus.length = 0;
		if (!error && response.statusCode == 200) {
            var csv = body;
			var data = csv.split("\n");
			for(var x=0; x<data.length-1; x++){

				d = data[x].split(",");
				var data_arr = new Array();
				data_arr["route_real_id"] = d[1];
				data_arr["time_delay"] = d[5];
				data_arr["headsign"] = d[7];
				data_arr["lat"] = d[9];
				data_arr["lon"] = d[10];
				//filter to match route_short_name to route_real_id, on sys map take this filter out
				if(d[1] === route_short_name){
					realbus.push(data_arr);
				}
                if(x == data.length-1){
                	return realbus;
                }
			}

			return realbus;

        } else {
			console.log("error in setRealTime");
        	return realbus;
        }
		
    });	
	console.log("rb len end times"+ realbus.length);
	if(realbus.length == 0){
		console.log("length zero ");
	}
	
};



exports.getRealBus = function(route_short_name) {
	
	this.setRealBus(route_short_name);
	
	return realbus;

};


setMyCenter = function(route_id, agency_name){	
    
	//"Intercity_Transit:route_center_11"
	client.get(agency_name+':route_center_'+route_id, function(err,cent){
	     console.log("my_cent:" + cent);
		 this.myCenter = cent;	
		 console.log("myCenter var is now: " + this.myCenter);
		return this.myCenter;
	 
	});
	
	
};

getMyCenter = function(route_id, agency_name) {
	
	setMyCenter(route_id, agency_name);
	
	return this.myCenter;

};

exports.setRouteCenter = function(route_id, agency_name){	
    
	//"Intercity_Transit:route_center_11"
	client.get(agency_name+':route_center_'+route_id, function(err,route_cent){
	     console.log("route_cent:" + route_cent);
		 console.log("route_id:" + route_id);
		 route_center = route_cent;	
		
	 
	});
	
	
};

exports.getRouteCenter = function(route_id, agency_name) {
	
	this.setRouteCenter(route_id, agency_name);
	setMyCenter(route_id, agency_name);
	return route_center;

};

exports.setRouteBox = function(route_id, agency_name){	
    
	//"Intercity_Transit:route_center_11"
	client.get(agency_name+':route_box_'+route_id, function(err,box){
	     console.log("route_box:" + box);
		 route_box = box;	
		
	 
	});
	
	
};

exports.getRouteBox = function(route_id, agency_name) {
	
	this.setRouteBox(route_id, agency_name);
	
	return route_box;

};



//@redis.SADD(@agency_name+"_transfers_to_stop_"+stop)
//STOPS
exports.setTransfers = function(route_id, agency_name) {
	
    if(transfers.length >= 1){
    	 transfers.length = 0;
    }
	//TODO iterate through stops here
	
    client.smembers(agency_name+'_stops_to_route_'+route_id, function(err,stop_ids) {

	   if (err) {
           // through sickness and health!
		   //error checking here 

	      } else {
			  i++;
			  for(var i = 0, len = stop_ids.length; i < len; i++) {  
		  	      var k = 0;
	              client.smembers(agency_name+'_transfers_to_stop_'+stop_ids[i], function(err, route_ids) {
			  	    if (err) {
			  	  		//nothing here
			  	    } else {
						for(x=0; x<route_ids.length; x++){
							var str_split = route_ids[x].split(":");
							var my_stop_id = str_split[0];
							var my_transfer = str_split[1]; 
							var data_arr = new Array();
							data_arr['stop_id'] = my_stop_id;
							data_arr['transfer'] = my_transfer;
	 		  				transfers.push(data_arr);
							//console.log(my_stop_id + " "+ my_transfer);
					
						}
						
 		  				 if(k == stop_ids.length-1){
 							 //exports.setTransferRouteMap(my_transfer, agency_name);
							 //var trans_map = new Array();
							 //trans_map = exports.setTransferRouteMap(my_transfer, agency_name);
							 //console.log("trans map len: "+trans_map.length);
 		  					 return transfers;
 		  				 } 
			  	    }
					k++;
			  	  });	
		
	     }
		 
	  }
	});	

};




exports.getTransfers = function(route_id, agency_name) {
	this.setTransfers(route_id, agency_name);
	
	return transfers;

};




//STOPS
exports.setTransferMarkers = function(route_id, agency_name) {
	console.log("something: "+exports.getTransfers(route_id, agency_name));
    if(transfer_markers.length >= 1){
    	 transfer_markers.length = 0;
    }

	var i = 0;
	//pass in route_ids as array then iterate 
		
    //_trans_route_shapes_


};




exports.getTransferMarkers = function(route_id, agency_name) {
	this.setTransferMarkers(route_id, agency_name);
	
	return transfer_markers;

};







