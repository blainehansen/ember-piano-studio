<!-- data-kal="direction: 'today-past', useYearNav: false" -->

<!-- {{render "lesson-enter"}} -->

{{view App.ToggleAreaView innerBinding=queued truePrint="Queued" falsePrintBinding=student.full_name}}

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
