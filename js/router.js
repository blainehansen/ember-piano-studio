App.Router.map(function() {
	this.resource('users', function() {
	this.route('user');
});
this.resource('teachers', function() {
	this.route('view_teacher', { path: ':teacher_id' });
});
});