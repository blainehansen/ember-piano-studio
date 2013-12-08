App = Ember.Application.create({
	currentPath: ''
});
$.couch.urlPrefix = "http://localhost/_couch";

App.LogUser = Ember.Object.extend({
	email: null,
	id: function() {
		return 'org.couchdb.user:'+this.get('email');
	}.property('email'),
	loggedIn: function() {
		return !!this.get('email');
	}.property('email')
});

App.CurrentUser = App.LogUser.create()

App.EditableView = Ember.View.extend({
	templateName: 'editable',

	editing: false,

	click: function(event) {
		if (!this.get('editing')) {
			this.set('editing', true);
		}
	},

	keyPress: function(event) {
		if (this.get('editing') && event.which == 13) {
			this.set('editing', false);
		}
	}
});


App.Person = DS.Model.extend({
	first_name: DS.attr(),
	last_name: DS.attr(),
	full_name: function() {
		return this.get('first_name') + ' ' + this.get('last_name');
	}.property('first_name', 'last_name')
});

App.CouchNamespace = '_couch';
App.UserAdapter =  EmberCouchDBKit.DocumentAdapter.extend({ namespace: App.CouchNamespace, db: '_users'});
App.UserSerializer = EmberCouchDBKit.DocumentSerializer.extend();

App.User = App.Person.extend({
	name: DS.attr('string'), // Actually their primary email.
	customer: DS.belongsTo('customer', {async: true }),
	teacher: DS.belongsTo('teacher', {async: true }),
	derived_key: DS.attr(),
	iterations: DS.attr(),
	password_scheme: DS.attr(),
	salt: DS.attr(),
	roles: DS.attr(),
	type: DS.attr()
});

App.TeacherAdapter =  EmberCouchDBKit.DocumentAdapter.extend({ namespace: App.CouchNamespace, db: 'teachers'});
App.TeacherSerializer = EmberCouchDBKit.DocumentSerializer.extend();

App.Teacher = DS.Model.extend({
	user: DS.belongsTo('user', {async: true}),
	description: DS.attr('string')
	// students: DS.hasMany('student', {async: true}),
	// lessons: DS.hasMany('lesson', {async: true}),
	// payments: DS.hasMany('payments', {async: true}),
	// expenses: DS.hasMany('expenses', {async: true})
});

var reducefunc = function(previousValue, thing) {
	return previousValue + thing.get('price');
};

App.CustomerAdapter =  EmberCouchDBKit.DocumentAdapter.extend({ namespace: App.CouchNamespace, db: 'customers'});
App.CustomerSerializer = EmberCouchDBKit.DocumentSerializer.extend();

App.Customer = DS.Model.extend({
	user: DS.belongsTo('user', {async: true}),
	description: DS.attr('string')
	// students: DS.hasMany('student', {async: true}),
	// payments: DS.hasMany('payments', {async: true}),
	// balance: function() {
	// 	var studentamount = this.get('students').reduce(0, function(previousValue, thing) {
	// 		return previousValue + thing.get('balance');
	// 	});
	// 	var paymentamount = this.get('payments').reduce(0, reducefunc);
	// 	return studentamount - paymentamount;
	// }.property('students.@each.balance', 'payments.@each.price')
});

App.StudentAdapter =  EmberCouchDBKit.DocumentAdapter.extend({ namespace: App.CouchNamespace, db: 'students'});
App.StudentSerializer = EmberCouchDBKit.DocumentSerializer.extend();

App.Student = App.Person.extend({
	lessons: DS.hasMany('lesson', {async: true}),
	teachers: DS.hasMany('teacher', {async: true}),
	expenses: DS.hasMany('expenses', {async: true}),
	balance: function() {
		var amount = this.get('lessons').reduce(0, reducefunc);
		return this.get('expenses').reduce(amount, reducefunc);
	}.property('lessons.@each.price', 'expenses.@each.price')
});

App.Transaction = DS.Model.extend({
	date: DS.attr('date'),
	price: DS.attr('number'),
});

App.PaymentAdapter =  EmberCouchDBKit.DocumentAdapter.extend({ namespace: App.CouchNamespace, db: 'payments'});
App.PaymentSerializer = EmberCouchDBKit.DocumentSerializer.extend();

App.Payment = App.Transaction.extend({
	method: DS.attr('string'),
	paying: DS.belongsTo('customer', {async: true}),
	receiving: DS.belongsTo('teacher', {async: true})
});

App.LessonAdapter =  EmberCouchDBKit.DocumentAdapter.extend({ namespace: App.CouchNamespace, db: 'lessons'});
App.LessonSerializer = EmberCouchDBKit.DocumentSerializer.extend();

App.Lesson = App.Transaction.extend({
	shortNoNotice: DS.attr('boolean'),
	student: DS.belongsTo('student', {async: true}),
	teacher: DS.belongsTo('teacher', {async: true})
});

App.ExpenseAdapter =  EmberCouchDBKit.DocumentAdapter.extend({ namespace: App.CouchNamespace, db: 'expenses'});
App.ExpenseSerializer = EmberCouchDBKit.DocumentSerializer.extend();

App.Expense = App.Transaction.extend({
	item: DS.attr('string')
});


// Something about making urls pretty.
// App.Router.reopen({
// 	location: 'history'
// });

App.MenuController = Ember.ArrayController.create();

App.ApplicationController = Ember.Controller.extend({

	actions: {
		logout: function() {
			$.couch.logout({
				success: function() {
					App.CurrentUser.set('email', null);
				}
			})
		}
	},

	currentPathDidChange: function() {
		var path = this.get('currentPath');
		App.set('currentPath', path);
		var route = this.get('target').router.currentHandlerInfos.get('lastObject').handler.routeName;

		var result = tree_search(App.Config, route);
		document.title = result.title + " | The Blaine Hansen Piano Studio";
		// Make a modification where routes without any children instead use the route of their parent.
		App.MenuController.set('content', result.children);
	}.observes('currentPath')
});

function tree_search(array, query) {
	if (!array[0]) return null;

	var result = $.grep(array, function(item) {return item.route == query || item.route+'.index' == query});
	if (result[0]) {
		return result[0];
	}
	else {
		result = $.grep(array, function(item) {return item.children});
		result = result.map(function(item) {return item.children});
		return tree_search([].concat.apply([], result), query);
	}
};


App.UsersUserRoute = Ember.Route.extend({
	model: function (params) {
		return this.get('store').find('user', App.CurrentUser.get('id'));
	}
});

App.UsersUserController = Ember.ObjectController.extend({
	actions: {
		saveModel: function() {
			this.get('model').save().then(
				function( data, textStatus, jqXHR ) {
					console.log('Saved successfully.');
				},
				function( jqXHR, textStatus, errorThrown ) {
					console.log(jqXHR);
					console.log(errorThrown);
					console.log(textStatus);
				}
			);
		},

		teacherSignUp: function() {
			var teacher = this.get('store').createRecord('teacher', {
				description: 'Yo yo yo'
			});
			var model = this.get('model');
			teacher.set('user', model);
			teacher.save().then(function() {
				model.set('teacher', teacher);
			});
			// model.save();
		},

		customerSignUp: function () {
			var model = this.get('model');
			var customer = this.get('store').createRecord('customer', {
				description: 'Why hello sir',
				user: model
			});
			customer.save().then(function() {
				model.set('customer', customer);
				model.save();
			});
		}

	}
});

App.UsersIndexController = Ember.Controller.extend({

	currentPathBinding: "App.currentPath",
	loggedInBinding: "App.CurrentUser.loggedIn",

	redirectFunction: function() {
		if (this.loggedIn && (App.get('currentPath') == 'users.index')) {
			this.transitionToRoute('users.user');
		}
		else if (!this.loggedIn && (App.get('currentPath') == 'users.user')) {
			this.transitionToRoute('users.index');
		}
	}.observes('App.currentPath', 'loggedIn'),

	actions: {
		signin: function() {

			this.setProperties({
				loginFailed: false,
				isProcessing: true
			});

			$.couch.login($.extend({ name: this.get('emailInput'), password: this.get('passwordInput')}, {
				success: function(data) {
					App.CurrentUser.set('email', data.name);
					this.set('isProcessing', false);
				}.bind(this),
				error: function(data) {
					App.CurrentUser.set('email', null);
					this.set('isProcessing', false);
					this.set('loginFailed', true);
				}.bind(this)
			}));
		},

		signup: function() {
			$.couch.signup({name: this.get('emailInput'), first_name: this.get('firstName'), last_name: this.get('lastName')}, this.get('passwordInput'), {
				success: function(data) {
					App.CurrentUser.set('email', this.get('emailInput'));
					this.set('isProcessing', false);
					console.log(data);
				}.bind(this),
				error: function(data) {
					App.CurrentUser.set('email', null);
					this.set('isProcessing', false);
					this.set('loginFailed', true);
				}.bind(this)
			})
		}
	}
});


// App.NeedsAuthMixin = Ember.Mixin.create({
// 	beforeModel: function(transition) {
// 		// We're using beforeModel here to
// 		// make sure the user is authenticated.
// 		var loginController = this.controllerFor('login');
// 		if (!loginController.get('hasLoggedIn')) {
// 			alert('you must log in!');
// 			loginController.set('afterLoginTransition', transition);
// 			this.transitionTo('login');
// 		}
// 	}
// });

// App.ArticlesRoute = Ember.Route.extend(App.NeedsAuthMixin);