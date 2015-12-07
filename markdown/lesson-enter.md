<div>
{{#view App.ExpandableView}}

	{{#if view.expanded}}
		<div {{action "toggle" target="view" on="click"}}>Show less...</div>

		{{#collection contentBinding="addLessons"}}
			{{content.date}}: {{content.price}} {{content.student.full_name}} {{content.comments}} {{content.badnotice}}.
			<span {{action "removeItem" contentIndex}}>Remove.</span>
		{{/collection}}

		Add any lessons you taught on
		<input type="text" class="auto-kal"><br/>
		{{#if currentStudent}}
			{{currentDate}}: {{currentStudent.full_name}}
			{{#view App.EnterFormView action="pushLesson"}}
				
				{{view Ember.Select content=controllers.teacher.lesson_types value=currentPrice optionValuePath="content.price" optionLabelPath="content.type"}} Absent without proper notice? {{view App.ToggleAreaView innerBinding=currentBadnotice truePrint="Yes" FalsePrint="No"}} {{input value=currentComments placeholder="Any comments?"}}

			{{/view}}
		{{else}}
			{{input value=currentStudentQuery placeholder="Which student?"}}

			{{#each student in queryResults}}
				<div {{action "selectResult" student}}>{{student.full_name}}</div>
			{{/each}}

		{{/if}}

		<button {{action "saveLessons"}}>Add these lessons.</button>

	{{else}}
		<div {{action "toggle" target="view" on="click"}}>Manually add lessons you've taught...</div>
	{{/if}}

{{/view}}
</div>