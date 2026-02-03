<script lang="ts">
	const scenarios = [
		{
			category: "Unexpected Errors (Defects)",
			tests: [
				{
					description: "Schema Parsing Error",
					detail: "Invalid data types cause Schema validation failure",
					path: "/schema-error",
				},
				{
					description: "Load Function Error",
					detail: "Database connection failure via Effect.dieMessage",
					path: "/load-error",
				},
			],
		},
		{
			category: "Expected Errors (Control Flow)",
			tests: [
				{
					description: "404 Not Found",
					detail: "Expected HTTP error with details metadata",
					path: "/not-found-error",
				},
				{
					description: "Redirect Example",
					detail: "Unauthenticated user redirected to login",
					path: "/redirect-example",
				},
				{
					description: "Form Validation",
					detail: "SvelteKit form actions with invalidEffect",
					path: "/form-validation",
				},
			],
		},
		{
			category: "Advanced Patterns",
			tests: [
				{
					description: "Concurrent Operations",
					detail: "Parallel Effects with nested spans in traces",
					path: "/concurrent-example",
				},
				{
					description: "Log Levels",
					detail: "Debug, Info, Warning severity classification",
					path: "/log-levels",
				},
				{
					description: "Timeout & Retry",
					detail: "Exponential backoff with retry attempts",
					path: "/timeout-retry",
				},
			],
		},
		{
			category: "Success Cases",
			tests: [
				{
					description: "Load Example",
					detail: "Successful data loading via load function",
					path: "/load-example",
				},
				{
					description: "Home Page",
					detail: "Successful remote query with error boundary",
					path: "/",
				},
			],
		},
	];
</script>

<div class="container">
	<h1>Test Scenarios</h1>
	<p>
		Comprehensive test suite for error handling, logging, and OpenTelemetry
		tracing
	</p>

	{#each scenarios as category}
		<section>
			<h2>{category.category}</h2>
			<ul>
				{#each category.tests as test}
					<li>
						<a href={test.path}>{test.description}</a>
						<span class="detail">{test.detail}</span>
					</li>
				{/each}
			</ul>
		</section>
	{/each}

	<div class="info">
		<h2>Monitoring</h2>
		<p>
			<strong>Grafana:</strong>
			<a href="http://localhost:3001" target="_blank" rel="noreferrer">
				http://localhost:3001
			</a>
			(anonymous access enabled)
		</p>
		<p>
			<strong>Tempo:</strong>
			<a href="http://localhost:3200" target="_blank" rel="noreferrer">
				http://localhost:3200
			</a>
		</p>
	</div>
</div>

<style>
	.container {
		max-width: 800px;
		margin: 2rem auto;
		padding: 1.5rem;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
			Oxygen, Ubuntu, Cantarell, sans-serif;
	}

	h1 {
		margin-bottom: 0.5rem;
	}

	h2 {
		margin-top: 0;
		margin-bottom: 1rem;
		font-size: 1.25rem;
		color: #333;
	}

	section {
		margin: 2rem 0;
		padding: 1.5rem;
		background: #fafafa;
		border-radius: 0.5rem;
		border: 1px solid #e0e0e0;
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	li {
		margin: 0.75rem 0;
		padding: 0.5rem;
		background: white;
		border-radius: 0.25rem;
		border-left: 3px solid #0070f3;
	}

	a {
		color: #0070f3;
		text-decoration: none;
		font-weight: 600;
		display: block;
		margin-bottom: 0.25rem;
	}

	a:hover {
		text-decoration: underline;
	}

	.detail {
		color: #666;
		font-size: 0.9rem;
		display: block;
	}

	.info {
		margin-top: 2rem;
		padding: 1rem;
		background: #f5f5f5;
		border-radius: 0.5rem;
	}
</style>
