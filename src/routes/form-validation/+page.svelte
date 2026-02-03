<script lang="ts">
	import { enhance } from "$app/forms";

	let { form } = $props();
</script>

<div class="container">
	<h1>Form Validation (invalidEffect)</h1>

	<form method="POST" use:enhance>
		<div class="field">
			<label for="email">Email</label>
			<input
				type="email"
				id="email"
				name="email"
				class:error={form?.email}
			/>
			{#if form?.email}
				<span class="error-message">{form.email}</span>
			{/if}
		</div>

		<div class="field">
			<label for="password">Password</label>
			<input
				type="password"
				id="password"
				name="password"
				class:error={form?.password}
			/>
			{#if form?.password}
				<span class="error-message">{form.password}</span>
			{/if}
		</div>

		<div class="field">
			<label for="confirmPassword">Confirm Password</label>
			<input
				type="password"
				id="confirmPassword"
				name="confirmPassword"
				class:error={form?.confirmPassword}
			/>
			{#if form?.confirmPassword}
				<span class="error-message">{form.confirmPassword}</span>
			{/if}
		</div>

		<button type="submit">Register</button>
	</form>

	<div class="instructions">
		<h3>Try these scenarios:</h3>
		<ul>
			<li>Submit with empty email → "Email is required"</li>
			<li>Submit with invalid email → "Email must be valid"</li>
			<li>Submit with password &lt; 8 chars → "Password must be at least 8 characters"</li>
			<li>Submit with mismatched passwords → "Passwords do not match"</li>
			<li>Submit valid form → Success!</li>
		</ul>
	</div>

	<p class="note">
		Check Grafana logs to see form validation errors logged as Warnings (expected
		control flow) with field metadata.
	</p>
</div>

<style>
	.container {
		max-width: 600px;
		margin: 2rem auto;
		padding: 1.5rem;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
			Oxygen, Ubuntu, Cantarell, sans-serif;
	}

	form {
		margin: 2rem 0;
		padding: 2rem;
		background: #f5f5f5;
		border-radius: 0.5rem;
	}

	.field {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
		color: #333;
	}

	input {
		width: 100%;
		padding: 0.75rem;
		border: 2px solid #ddd;
		border-radius: 0.25rem;
		font-size: 1rem;
		box-sizing: border-box;
	}

	input:focus {
		outline: none;
		border-color: #0070f3;
	}

	input.error {
		border-color: #f44336;
	}

	.error-message {
		display: block;
		margin-top: 0.5rem;
		color: #f44336;
		font-size: 0.875rem;
	}

	button {
		width: 100%;
		padding: 0.75rem;
		background: #0070f3;
		color: white;
		border: none;
		border-radius: 0.25rem;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
	}

	button:hover {
		background: #0051cc;
	}

	.instructions {
		margin: 1.5rem 0;
		padding: 1rem;
		background: #fff3e0;
		border-radius: 0.5rem;
	}

	.instructions h3 {
		margin-top: 0;
	}

	.instructions ul {
		margin: 0.5rem 0 0 0;
		padding-left: 1.5rem;
	}

	.instructions li {
		margin: 0.25rem 0;
	}

	.note {
		margin-top: 2rem;
		padding: 1rem;
		background: #e3f2fd;
		border-left: 4px solid #2196f3;
		border-radius: 0.25rem;
	}
</style>
