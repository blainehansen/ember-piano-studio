{{#if isDirty}}
There are unsaved changes.
{{else}}
All data up to date!
{{/if}}

<div>
Primary Email: {{name}}<br/>

First Name: {{view App.EditableView innerBinding=first_name}}<br/>

Last Name: {{view App.EditableView innerBinding=last_name}}<br/>

Full Name: {{full_name}}<br/>

Your current balance: ${{balance}}<br/>

{{#unless student}}
	{{#view App.ExpandableView}}
		{{#if view.expanded}}
			<div {{action "toggle" target="view" on="click"}} >Show less...</div>

			<form {{action "studentSignUp" on="submit"}}>

				<button type="submit">Make it so!</button>
			</form>

		{{else}}
			<div {{action "toggle" target="view" on="click"}} >Sign up to be a Student...</div>
		{{/if}}
	{{/view}}
{{/unless}}

All students you manage:<br/>
{{#each student in students}}
	{{render "student" student}}<br/>
{{/each}}

{{#view App.EnterFormView action="studentCreate"}}
	{{input value=studentFirstNameInput placeholder="First Name" id="student_create_focus"}} {{input value=studentLastNameInput placeholder="Last Name"}}
{{/view}}

The payments you've made:<br/>
{{#each payments}}
	{{date}}: {{price}}, {{method}}. Paid to: {{receiving.full_name}}<br/>
{{/each}}

The payments you've received:<br/>
{{#each receipts}}
	{{date}}: {{price}}, {{method}}. From: {{paying.full_name}}<br/>
{{/each}}
</div>


<div>
{{#if teacher}}

	{{render "teacher" teacher}}

{{else}}

	{{#view App.ExpandableView}}
		{{#if view.expanded}}
			<div {{action "toggle" target="view" on="click"}} >Show less...</div>

			<form {{action "teacherSignUp" on="submit"}}>

				<label>Description</label>
				{{input value=teacherDescriptionInput type="text"}}

				<button type="submit">Make it so!</button>
			</form>
		{{else}}
			<div {{action "toggle" target="view" on="click"}} >Sign up to be a Teacher...</div>
		{{/if}}
	{{/view}}

{{/if}}
</div>