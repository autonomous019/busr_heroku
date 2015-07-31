var entries = [
{"id":1, "title":"Hello World!", "body":"need to display agencies then routes for agency", "published":"6/2/2013"},
{"id":2, "title":"Ride the N Line", "body":"please don't get stuck in the tunnel by Safeway!", "published":"6/3/2013"}];

exports.getBusrEntries = function() {
	return entries;
}

exports.getBusrRoutes = function() {
	return routes;
}

exports.getBusrRoute = function(id) {
	for(var i=0; i<routes.length; i++) {
		if(routes[i].id == id) return routes[i];
	}
}