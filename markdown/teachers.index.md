{{#each model}}
	{{#link-to "teachers.view_teacher" this}}{{user.full_name}} {{description}}{{/link-to}}
{{/each}}