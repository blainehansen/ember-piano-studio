{{#if isProcessing}}
Processing...
{{/if}}

Sign in:

<form {{action "signin" on="submit"}}>
	{{#if loginFailed}}
	Invalid Email or password.
	{{/if}}

	<label>Email</label>
	{{input value=emailInput type="text"}}

	<label>Password</label>
	{{input value=passwordInput type="password"}}

	<button type="submit" class="btn" {{bindAttr disabled="isProcessing"}}>Log in!</button>
</form>

Or sign up:

<form {{action "signup" on="submit"}}>
	<label>Email</label>
	{{input value=emailInput type="text"}}

	<label>Password</label>
	{{input value=passwordInput type="password"}}

	<label>First Name</label>
	{{input value=firstName type="text"}}

	<label>Last Name</label>
	{{input value=lastName type="text"}}

	<button type="submit" class="btn" {{bindAttr disabled="isProcessing"}}>Sign up!</button>
</form>