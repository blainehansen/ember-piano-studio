Primary Email: {{name}}

First Name: {{view App.EditableView innerBinding=first_name}}

Last Name: {{view App.EditableView innerBinding=last_name}}

Full Name: {{full_name}}

<div>
{{#if customer}}
	You As a Customer:

	{{#with customer}}

		{{description}}

		

	{{/with}}

{{else}}
<button {{action 'customerSignUp'}}>Sign up to be a customer.</button>
{{/if}}
</div>

<div>
{{#if teacher}}
	You As a Teacher:

	{{#with teacher}}

		{{description}}

		

	{{/with}}

{{else}}
<button {{action 'teacherSignUp'}}>Sign up to be a teacher.</button>
{{/if}}
</div>

<button {{action 'saveModel'}}>Save Changes</button>