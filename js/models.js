var reducefunc = function(previousValue, thing) {
	return previousValue + thing.get('price');
};

App.CouchNamespace = '_couch';
App.UserAdapter =  EmberCouchDBKit.DocumentAdapter.extend({ namespace: App.CouchNamespace, db: '_users'});
App.UserSerializer = EmberCouchDBKit.DocumentSerializer.extend();

App.TeacherAdapter =  EmberCouchDBKit.DocumentAdapter.extend({ namespace: App.CouchNamespace, db: 'teachers'});
App.TeacherSerializer = EmberCouchDBKit.DocumentSerializer.extend();

App.StudentAdapter =  EmberCouchDBKit.DocumentAdapter.extend({ namespace: App.CouchNamespace, db: 'students'});
App.StudentSerializer = EmberCouchDBKit.DocumentSerializer.extend();

App.RegistrationAdapter =  EmberCouchDBKit.DocumentAdapter.extend({ namespace: App.CouchNamespace, db: 'registrations'});
App.RegistrationSerializer = EmberCouchDBKit.DocumentSerializer.extend();

App.PaymentAdapter =  EmberCouchDBKit.DocumentAdapter.extend({ namespace: App.CouchNamespace, db: 'payments'});
App.PaymentSerializer = EmberCouchDBKit.DocumentSerializer.extend();

App.LessonAdapter =  EmberCouchDBKit.DocumentAdapter.extend({ namespace: App.CouchNamespace, db: 'lessons'});
App.LessonSerializer = EmberCouchDBKit.DocumentSerializer.extend();

App.ExpenseAdapter =  EmberCouchDBKit.DocumentAdapter.extend({ namespace: App.CouchNamespace, db: 'expenses'});
App.ExpenseSerializer = EmberCouchDBKit.DocumentSerializer.extend();

App.Person = DS.Model.extend({
	first_name: DS.attr(),
	last_name: DS.attr(),
	full_name: function() {
		var first_name = this.get('first_name');
		var last_name = this.get('last_name');
		if (!first_name && !last_name) {
			var user = this.get('user');
			return user.get('first_name') + ' ' + user.get('last_name');
		}
		else {
			return first_name + ' ' + last_name;
		}
	}.property('first_name', 'last_name', 'user.first_name', 'user.last_name')
});

App.User = App.Person.extend({
	// braintree_id: DS.attr(),
	name: DS.attr('string'), // Actually their primary email.
	teacher: DS.belongsTo('teacher', {async: true }),
	student: function() {
		if (this.get('students').length) return false;
		var results = this.get('students').filter(function(student) {
			return !student.get('first_name') && !student.get('last_name');
		});
		return !!results.length;
	}.property('students.@each'),
	students: DS.hasMany('student', {async: true}),

	receipts: DS.hasMany('payment', {async: true, inverse: 'receiving'}),
	payments: DS.hasMany('payment', {async: true, inverse: 'paying'}),
	balance: function() {
		var studentamount = this.get('students').reduce(function(previousValue, thing) {
			return previousValue + thing.get('balance');
		}, 0);
		var paymentamount = this.get('payments').reduce(reducefunc, 0);
		return studentamount - paymentamount;
	}.property('students.@each.balance', 'payments.@each.price'),

	derived_key: DS.attr(),
	iterations: DS.attr(),
	password_scheme: DS.attr(),
	salt: DS.attr(),
	roles: DS.attr(),
	type: DS.attr()
});

App.Teacher = DS.Model.extend({
	// merchant_id: DS.attr(),
	user: DS.belongsTo('user', {async: true}),
	description: DS.attr('string'),
	student_registrations: DS.hasMany('registration', {async: true}),
	lessons: DS.hasMany('lesson', {async: true}),
	lesson_types: DS.attr(),
	payments: DS.hasMany('payment', {async: true}),
	expenses: DS.hasMany('expense', {async: true})
});

App.Student = App.Person.extend({
	user: DS.belongsTo('user', {async: true}),
	lessons: DS.hasMany('lesson', {async: true}),
	teacher_registrations: DS.hasMany('registration', {async: true}),
	expenses: DS.hasMany('expense', {async: true}),
	balance: function() {
		return this.get('lessons').reduce(reducefunc, 0) + this.get('expenses').reduce(reducefunc, 0);
	}.property('lessons.@each.price', 'expenses.@each.price')
});

App.Registration = DS.Model.extend({
	teacher: DS.belongsTo('teacher', {async: true}),
	student: DS.belongsTo('student', {async: true}),
	active: DS.attr('boolean'),
	type: DS.attr('string')
});

App.Transaction = DS.Model.extend({
	date: DS.attr('date'),
	price: DS.attr('number'),
});

App.Payment = App.Transaction.extend({
	method: DS.attr('string'),
	paying: DS.belongsTo('user', {async: true}),
	receiving: DS.belongsTo('user', {async: true})
});

App.Lesson = App.Transaction.extend({
	student: DS.belongsTo('student', {async: true}),
	teacher: DS.belongsTo('teacher', {async: true}),
	badnotice: DS.attr('boolean'),
	type: DS.attr('string')
});

App.Expense = App.Transaction.extend({
	item: DS.attr('string')
});

// App.Customer = DS.Model.extend({
// 	user: DS.belongsTo('user', {async: true}),
// 	description: DS.attr('string'),
// 	students: DS.hasMany('student', {async: true}),
// 	payments: DS.hasMany('payment', {async: true}),
// 	balance: function() {
// 		var studentamount = this.get('students').reduce(function(previousValue, thing) {
// 			return previousValue + thing.get('balance');
// 		}, 0);
// 		var paymentamount = this.get('payments').reduce(reducefunc, 0);
// 		return studentamount - paymentamount;
// 	}.property('students.@each.balance', 'payments.@each.price')
// });