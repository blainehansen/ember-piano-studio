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

App.MenuController = Ember.ArrayController.create();

function checkSession() {
	if (!App.CurrentUser.get('loggedIn')) {
		$.couch.session({
			success: function(data) {
				if (data.userCtx.name) App.CurrentUser.set('email', data.userCtx.name);
			}
		});
	}
};

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
		Ember.run.once(this, function() {
			checkSession();

			var path = this.get('currentPath');
			App.set('currentPath', path);
			var route = this.get('target').router.currentHandlerInfos.get('lastObject').handler.routeName;

			var logged = App.CurrentUser.get('loggedIn');
			if (logged && (path == 'users.index')) {
				this.transitionToRoute('users.user');
			}
			else if (!logged && (path == 'users.user')) {
				this.transitionToRoute('users.index');
			}

			var result = tree_search(App.Config, route);
			document.title = result.title + " | The Blaine Hansen Piano Studio";
			// Make a modification where routes without any children instead use the route of their parent.
			App.MenuController.set('content', result.children);
		});
	}.observes('currentPath', 'App.CurrentUser.loggedIn')
});

App.UsersUserRoute = Ember.Route.extend({

	model: function (params) {
		var self = this;
		if (!App.CurrentUser.get('loggedIn')) {
			return new Ember.RSVP.Promise(function(resolve, reject) {
				checkSession();
				self.addObserver('App.CurrentUser.loggedIn', function() {
					if (App.CurrentUser.get('loggedIn')) {
						self.removeObserver('App.CurrentUser.loggedIn');
						self.get('store').find('user', App.CurrentUser.get('id')).then(
							function(record){ resolve(record); },
							function(error){ reject(error); }
						);
					}
				});
			});
		}
		else return this.get('store').find('user', App.CurrentUser.get('id'));
	}
});

App.ToggleAreaView = Ember.View.extend({
	tagName: 'span',

	templateName: 'toggle-area',

	click: function(event) {
		this.set('inner', !this.get('inner'));
	}
});

App.ExpandableView = Ember.View.extend({

	expanded: false,

	actions: {
		toggle: function() {
			this.set('expanded', !this.get('expanded'));
		}
	}
});

App.FocusInputComponent = Ember.TextField.extend({
	becomeFocused: function() {
		this.$().focus();
	}.on('didInsertElement')
});

App.EditableView = Ember.View.extend({
	templateName: 'editable',

	editing: false,

	click: function(event) {
		if (!this.get('editing')) {
			this.set('editing', true);
			this.get('controller').send('childViewEditing', true);
		}
	},

	keyPress: function(event) {
		if (this.get('editing') && event.which == 13) {
			this.set('editing', false);
			this.get('controller').send('childViewEditing', false);
		}
	}
});

App.EnterFormView = Ember.View.extend({

	action: '',

	keyPress: function(event) {
		if (event.which == 13) {
			this.get('controller').send(this.get('action'));
		}
	}
});

function saveOn (target, attribute) {
	return new Ember.RSVP.Promise(function(resolve, reject) {
		if (target.get(attribute) || target.get(attribute) === undefined) {
			target.save().then(function(record){ resolve(record); }, function(error){ reject(error); });
		}
		else {
			target.addObserver(attribute, function () {
				if (target.get(attribute)) {
					target.removeObserver(attribute);
					target.save().then(function(record){ resolve(record); }, function(error){ reject(error); });
				}
			});
		}
	});
};

function safeSave(model) {
	return new Ember.RSVP.Promise(function(resolve, reject) {
		attributes = [];
		model.eachRelationship(function(name, descriptor) {
			if (descriptor.kind == 'belongsTo') {
				attributes.push(name);
			}
		});

		var checkAttributes = function() {
			if (attributes.every(function(item) {return (model.get(item) === null) || !!model.get(item + '.isFulfilled');} )) {
				Ember.run.once(this, function() {
					model.save().then(function(record){
						console.log('Saved successfully.');
						resolve(record);
					}, function(error) {
						console.log('Error while saving.');
						reject(error);
					});
				});
			}
		};
		checkAttributes();
		attributes.forEach(function(item) {
			if ((model.get(item) !== null) && !model.get(item + '.isFulfilled')) {
				model.addObserver(item + '.isFulfilled', function() {
					if (model.get(item)) {
						model.removeObserver(item);
					}
					checkAttributes();
				});
			}
		});
	});
};

function promiseAction(promise, action) {
	if (typeof promise.save === 'function') {
		action(promise);
	}
	else {
		promise.then(function(resolvedPromise) {
			action(resolvedPromise);
		});
	}
};

App.LessonEnterController = Ember.Controller.extend({

	needs: 'teacher',

	addLessons: [],

	currentStudent: null, currentComments: '', currentBadNotice: false, currentStudentQuery: '',

	// currentDaysAgo: 0, 

	// currentDate: function() {
	// 	var d = new Date();
	// 	return d.setDate(d.getDate() - this.get('currentDaysAgo'));
	// }.property('currentDaysAgo'),

	// days: function() {
	// 	if (this.get('currentDaysAgo') == 1) return 'day';
	// 	else return 'days';
	// }.property('currentDaysAgo'),

	queryResults: [],

	queryStudent: function() {
		var query = this.get('currentStudentQuery');
		if (query) {
			var results = this.get('controllers.teacher.model.students').filter(function(item) {
				return (item.get('last_name') == query) || (item.get('last_name') == query);
			});
			this.set('queryResults', results);
		}
	}.observes('currentStudentQuery'),

	actions: {
		pushLesson: function() {
			this.get('addLessons').pushObject(this.get('store').createRecord('lesson', {
				date: this.get('currentDate'),
				teacher: this.get('controllers.teacher.model'),
				student: this.get('currentStudent'),
				price: this.get('currentPrice'),
				comments: this.get('currentComments'),
				badnotice: this.get('currentBadNotice'),
			}));

			this.setProperties({
				currentStudent: null, currentComments: '', currentBadNotice: false, currentStudentQuery: ''
			});
		},

		saveLessons: function() {
			var teacher = this.get('controllers.teacher.model');
			var lessons = this.get('controllers.teacher.model.lessons');
			var students = this.get('controllers.teacher.model.students');
			this.get('addLessons').forEach(function(item) {
				saveOn(item, 'isFulfilled').then(function() {
					lessons.pushObject(item);
					var student = students.filter(function(potential) {
						return potential.id == item.student.id;
					});
					student = student.get('student');
					student.get('lessons').pushObject(item);
					saveOn(teacher, 'isFulfilled');
					saveOn(student, 'isFulfilled');
				});
			});
			addLessons = [];
			this.setProperties({
				currentStudent: null, currentComments: '', currentBadNotice: false, currentStudentQuery: ''
			});
		},

		selectResult: function(result) {
			this.set('currentStudent', result);
		},

		removeItem: function(index) {
			this.get('addLessons').removeAt(index);
		}
	}
});

function sfunc() { this.send('saveModel'); };

App.EditableModelMixin = Ember.Mixin.create({

	// childrenViewsSaved: function() {
	// 	return !this.get('childrenViewsEditing') && !this.get('isDirty');
	// }.property('childrenViewsEditing', 'isDirty'),

	childrenViewsEditing: 0,

	// childrenControllersSaved: function() {
	// 	return !this.get('childrenControllersNotSaved');
	// }.property('childrenControllersNotSaved'),

	// childrenControllersNotSaved: 0,

	// thisLevelSaved: function() {
	// 	return this.get('childrenViewsSaved') && this.get('childrenControllersSaved');
	// }.property('childrenViewsSaved', 'childrenControllersSaved'),

	actions: {
		childViewEditing: function(which) {
			var num = which ? 1: -1;
			this.set('childrenViewsEditing', this.get('childrenViewsEditing') + num);
			if (!this.get('childrenViewsEditing') && this.get('isDirty')) {
				console.log('Save block');
				// if (!this.get('isTop')) this.get('parentView').get('controller').send('childControllerNotSaved', this.get('thisLevelSaved'));
				Ember.run.debounce(this, sfunc, 5000);
			}
		},

		saveModel: function() {
			var model = this.get('model');
			console.log(model);
			promiseAction(model, safeSave);
		}
	}
});

App.TeacherController = Ember.ObjectController.extend(App.EditableModelMixin, {

	currentType: '', currentPrice: '',

	index_lesson_types: function() {
		if (!this.get('lesson_types')) return;
		return this.get('lesson_types').map(function(i, index) {
			return {item: i, index: index};
		});
	}.property('lesson_types.@each'),

	actions: {
		removeType: function(index) {
			this.get('lesson_types').removeAt(index);
		},

		pushType: function() {
			if (!this.get('lesson_types')) this.set('lesson_types', []);
			this.get('lesson_types').pushObject(Ember.Object.create({type: this.get('currentType'), price: this.get('currentPrice')}));
			this.setProperties({currentType: '', currentPrice: ''});
			$("#lesson_type_focus").focus()
		}
	}
});

App.StudentController = Ember.ObjectController.extend(App.EditableModelMixin);

App.UsersUserController = Ember.ObjectController.extend(App.EditableModelMixin, {

	actions: {
		teacherSignUp: function() {
			var user = this.get('model');
			var teacher = this.get('store').createRecord('teacher', {
				description: this.get('teacherDescriptionInput'),
				user: user
			});
			user.set('teacher', teacher);
			saveOn(teacher, 'user.isFulfilled').then(function() {
				saveOn(user, 'isFulfilled');
			});
		},

		studentSignUp: function() {
			var user = this.get('model');
			var students = user.get('students');
			var student = this.get('store').createRecord('student', {
				user: user
			});
			students.pushObject(student);
			saveOn(student, 'user.isFulfilled').then(function() {
				saveOn(user, 'isFulfilled');
			});
		},

		studentCreate: function() {
			var user = this.get('model');
			var students = user.get('students');
			var student = this.get('store').createRecord('student', {
				first_name: this.get('studentFirstNameInput'),
				last_name: this.get('studentLastNameInput'),
				user: user
			});
			students.pushObject(student);
			this.setProperties({
				studentFirstNameInput: '',
				studentLastNameInput: ''
			});
			$('#student_create_focus').focus();
			saveOn(student, 'user.isFulfilled').then(function() {
				saveOn(user, 'isFulfilled');
			});
		}
	}
});

App.UsersIndexController = Ember.Controller.extend({

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

App.TeachersIndexRoute = Ember.Route.extend({
	model: function(params) {
		return this.get('store').find('teacher');
	}
});

App.TeachersViewTeacherRoute = Ember.Route.extend({
	model: function(params) {
		return this.get('store').find('teacher', params.teacher_id);
	}
});

App.TeachersViewTeacherController = Ember.ObjectController.extend({
	eligible_students: function() {
		self = this;
		this.store.find('user', App.CurrentUser.get('id')).then(function(user) {
				var students = user.get('students').then(function(students) {
					self.set('eligible_students', students);
				});
			}
		);
		return [];
	}.property('App.CurrentUser.id'),

	actions: {
		register: function(student, type) {
			var teacher_id = this.get('id');
			var model = this.get('model');
			var self = this;
			student.get('teacher_registrations').then(function(teacher_registrations) {
				console.log(teacher_registrations);
				var result = teacher_registrations.findBy('teacher', teacher_id);
				console.log(result);
				if (result) {
					result.set('active', true);	
				}
				else {
					var registration = self.get('store').createRecord('registration', {
						teacher: model,
						student: student,
						active: true,
						type: type
					});
					console.log(registration);

					saveOn(registration, 'isFulfilled').then(function(registration) {
						console.log(registration);
						model.get('student_registrations').then(function(array) {
							array.pushObject(registration);
							saveOn(model, 'isFulfilled');
						});
						student.get('teacher_registrations').then(function(array) {
							array.pushObject(registration)
							saveOn(student, 'isFulfilled');
						});
					});
				}
			});
		},

		unregister: function(student) {
			console.log('unregister');
		}
	}
});

App.StudentRegistrationView = Ember.View.extend({
	type: '', price: '',

	registered: function() {
		var teacher = this.get('controller').get('model');
		var teacher_id = teacher.get('id');
		var self = this;
		this.get('inner').get('teacher_registrations').then(function(teacher_registrations) {
			// console.log(teacher_registrations);
			var result = teacher_registrations.findBy('teacher', teacher_id);
			// console.log(result);
			// console.log(result.get('active'));
			if (result.get('active')) {
				console.log('true');
				self.set('registered', true);
				var type = result.get('type');
				var price = self.get('lesson_types').findBy('type', type);
				self.set('type', type);
				self.set('price', price);
			}
		});
		return false;
	}.property('inner.teacher_registrations.@each', 'model.lesson_types.@each')
});

// Something about making urls pretty.
// App.Router.reopen({
// 	location: 'history'
// });

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