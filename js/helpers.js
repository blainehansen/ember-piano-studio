Ember.Handlebars.registerHelper('varLink', function(name) {
	var name = Ember.Handlebars.get(this, name);
	arguments = [].slice.call(arguments, 2);
	arguments.unshift(name);
	return Ember.Handlebars.helpers.linkTo.apply(this, arguments);
});

function capitalize(s){
	return s.toLowerCase().replace( /\b./g, function(a){ return a.toUpperCase(); } );
};