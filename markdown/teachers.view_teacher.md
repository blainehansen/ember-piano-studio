{{user.full_name}}

{{description}}

Students Registered with this Teacher:
{{#each student in eligible_students}}
	{{student.full_name}}:
	{{#view App.StudentRegistrationView innerBinding="student"}}
		{{view.registered}}
		{{#if view.registered}}
			Registered: {{view.type}} {{view.price}} <button {{action "unregister" student}}>Unregister</button>
		{{else}}
			{{#view App.ExpandableView}}
				{{#if view.expanded}}
					{{view Ember.Select contentBinding="lesson_types" value=currentType optionValuePath="content.type" optionLabelPath="content.type" prompt="Choose a Lesson Type"}}
					<button {{action "register" student currentType}}>Register</button>
					<span {{action "toggle" target="view" on="click"}}>Cancel</span>
				{{else}}
					<button {{action "toggle" target="view"}}>Register this Student</button>
				{{/if}}
			{{/view}}
		{{/if}}
	{{/view}}
{{/each}}

This Teacher's Lesson Types:
{{#each lesson_types}}
	{{type}}: ${{price}}.
{{/each}}