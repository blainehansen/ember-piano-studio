Your full time students:
		{{#for student in students}}
			{{student.full_name}}
		{{/for}}

		All lessons you've taught:
		{{#for lesson in lessons}}
			{{lesson.date}}: {{lesson.price}}. With: {{lesson.student.full_name}}
			{{#if lesson.shortNoNotice}}Gave short or no notice.{{/if}} 
		{{/for}}

		All payments you've received:
		{{#for payment in payments}}
			{{payment.date}}: {{payment.price}}, {{payment.method}}. From: {{payment.paying.user.full_name}}
		{{/for}}

		Any expenses you've incurred:
		{{#for expense in expenses}}
			{{expense.date}}: {{expense.price}}. {{expense.item}}
		{{/for}}

Your current balance: {{balance}}

		All students you manage:
		{{#for student in students}}
			{{student.full_name}}
		{{/for}}

		The payments you've made:
		{{#for payment in payments}}
			{{payment.date}}: {{payment.price}}, {{payment.method}}. Paid to: {{payment.receiving.user.full_name}}
		{{/for}}



App.Person = DS.Model.extend({
	firstName: DS.attr(),
	lastName: DS.attr(),
	fullName: function() {
		return this.get('firstName') + ' ' + this.get('lastName');
	}.property('firstName', 'lastName')
});

var reducefunc = function(previousValue, thing) {
	return previousValue + thing.get('price');
};

App.Customer = App.Person.extend({
	loginEmail: DS.attr(),

	otherEmail: DS.hasMany('email'),
	phones: DS.hasMany('phone'),
	students: DS.hasMany('student'),
	payments: DS.hasMany('payment'),
	balance: function() {
		var studentamount = this.get('students').reduce(0, function(previousValue, thing) {
			return previousValue + thing.get('balance');
		});
		var paymentamount = this.get('payments').reduce(0, reducefunc);
		return studentamount - paymentamount;
	}.property('students.@each.balance', 'payments.@each.price')
});

App.Student = App.Person.extend({
	
	price: DS.attr('number')
	lessons: DS.hasMany('lesson'),
	expenses: DS.hasMany('expense'),
	balance: function() {
		var amount = this.get('lessons').reduce(0, reducefunc);
		return this.get('expenses').reduce(amount, reducefunc);
	}.property('lessons.@each.price', 'expenses.@each.price')
});

App.Transaction = DS.Model.extend({
	date: DS.attr('date'),
	price: DS.attr('number')
});

App.Payment = App.Transaction.extend({
	method: DS.attr()
});

App.Lesson = App.Transaction.extend({
	shortNoNotice: DS.attr('boolean')
});

App.Expense = App.Transaction.extend({
	item: DS.attr()
});

// Adapter embedding mappings.
App.Application.map('App.Customer', {
	otherEmail: { embedded: 'always' },
	phones: { embedded: 'always' },
	students: { embedded: 'always' },
	payments: { embedded: 'always' }
};

App.Application.map('App.Student', {
	lessons: { embedded: 'always' },
	expenses: { embedded: 'always' }
};

// App.ApplicationAdapter = DS.RESTAdapter.extend({

// 	namespace: '_couch',

// 	buildURL: function(type, id) {
// 		id = id || '_all_docs?include_docs=true';

// 		return this._super(type, id);
// 	},

// 	createRecord: function(store, type, record) {
// 		var data = {};
// 		var serializer = store.serializerFor(type.typeKey);

// 		serializer.serializeIntoHash(data, type, record, { includeId: false });
// 		// TODO something about getting rid of any generated _rev.
// 		console.log("In createRecord");
// 		console.log(data);

// 		var id = get(record, 'id');

// 		return this.ajax(this.buildURL(type.typeKey, id), "PUT", { data: data });
// 	},

// 	updateRecord: function(store, type, record) {
// 		var data = {};
// 		var serializer = store.serializerFor(type.typeKey);

// 		// data = serializer.serializeIntoHash(data, type, record);
// 		serializer.serializeIntoHash(data, type, record);

// 		// var id = get(record, 'id');
// 		var id = record.id;
// 		console.log("In updateRecord");
// 		console.log(data);
// 		data = data[type.typeKey];

// 		return this.ajax(this.buildURL(type.typeKey, id), "PUT", { data: data });
// 	},

// 	deleteRecord: function(store, type, record) {
// 		var id = get(record, 'id');

// 		var rev = record.rev;

// 		return this.ajax(this.buildURL(type.typeKey, id), "DELETE", {headers: {"If-Match": rev}});
// 	}

// 	// pathForType: function(type) {
// 	// 	if (type == 'user') {
// 	// 		type = '_user';
// 	// 	}
// 	// 	return this._super(type);
// 	// }
// });

// App.ApplicationSerializer = DS.RESTSerializer.extend({
// 	extractSingle: function(store, type, payload, id, requestType) {
// 		root = type.typeKey;
// 		newJSON = {};
// 		newJSON[root] = payload;
// 		payload = newJSON;

// 		return this._super(store, type, payload, id, requestType);
// 	},

// 	extractArray: function(store, type, payload, id, requestType) {
// 		root = type.typeKey;
// 		root = Ember.String.pluralize(root);
// 		newJSON = {};

// 		newJSON[root] = payload.rows.map(function(row) {
// 			return row.doc;
// 		});
// 		payload = newJSON;

// 		return this._super(store, type, payload, id, requestType);
// 	},

// 	normalize: function(type, hash, property) {
// 		var json = { id: hash._id, rev: hash._rev};
// 		delete hash._id;
// 		delete hash._rev;

// 		for (var prop in hash) {
// 			json[prop] = hash[prop]; 
// 		}

// 		return this._super(type, json, property);
// 	},

// 	serialize: function(record, options) {
// 		var json = this._super(record, options);

// 		// json._id = json.id;
// 		json._rev = json.rev;
// 		delete json.id;
// 		delete json.rev;

// 		console.log("In serialize");
// 		console.log(json);
// 		return json;
// 	}

// 	// serializeIntoHash: function(data, type, record, options) {
// 	// 	// var root = Ember.String.decamelize(type.typeKey);
// 	// 	// data[root] = this.serialize(record, options);
// 	// 	// return this.serialize(record, options)
// 	// 	// hash[type.typeKey] = this.serialize(record, options);
// 	// 	return this.serialize(record, options);
// 	// }
// });
