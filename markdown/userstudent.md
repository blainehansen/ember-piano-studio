<div>
{{#view App.ExpandableView}}
	
	{{#if view.expanded}}
		<div {{action "toggle" target="view" on="click"}} >{{full_name}}. Show less...</div>

		Balance: ${{balance}}

		Your registered teachers:
		{{#each teacher_registrations}}
			{{teacher.user.full_name}}
		{{/each}}

		All your lessons:<br/>
		{{#each lessons}}
			{{date}}: {{price}}. With: {{teacher.full_name}}.
			{{#if badnotice}}Gave short or no notice.{{/if}}<br/>
		{{/each}}

	{{else}}
		<div {{action "toggle" target="view" on="click"}} >{{user.full_name}}. Show more...</div>
	{{/if}}

{{/view}}
</div>