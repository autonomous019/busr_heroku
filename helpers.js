var Handlebars = require('hbs');

	 Handlebars.registerHelper("Max", function(A, B){
	     return (A > B) ? A : B;
	 });
	 
	 
	 Handlebars.registerHelper("AgencyId", function(agency_name){
	     return agency_name;
	 });
	 
	 
	 Handlebars.registerHelper('link', function(text) {
		 //sample implmentation in agency.html
	   text = Handlebars.Utils.escapeExpression(text);
	   text = text.replace("/", "-");
	   
	   var result = text;

	   return new Handlebars.SafeString(result);
	 });
	 
	 Handlebars.registerHelper('ifCond', function(v1, v2, options) {
	   if(v1 === v2) {
	     return options.fn(this);
	   } else {
		   return "";
	   }
	   return options.inverse(this);
	 });
	 
	 Handlebars.registerHelper('no_underscore', function(text) {
		 //sample implmentation in agency.html
	   text = Handlebars.Utils.escapeExpression(text);
	   text = text.replace("_", " ");
	   
	   var result = text;

	   return new Handlebars.SafeString(result);
	 });
