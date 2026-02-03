<script lang="ts">
	let { data } = $props();
</script>

<div class="container">
	<h1>Timeout & Retry Pattern</h1>

	<section>
		<h2>Result</h2>
		<p>Status: {data.data.result}</p>
		<p>Attempts needed: {data.data.attemptCount}</p>
	</section>

	<div class="explanation">
		<h3>What's happening:</h3>
		<ol>
			<li>First attempt fails after 500ms</li>
			<li>Retry with exponential backoff (100ms, 200ms, 400ms...)</li>
			<li>Second attempt fails</li>
			<li>Third attempt succeeds</li>
			<li>Maximum 3 retry attempts before timing out</li>
		</ol>
	</div>

	<p class="note">
		Check the logs in Grafana to see the retry attempts with exponential
		backoff delays. You'll see Warning logs for failed attempts and Info for
		the successful one.
	</p>
</div>

<style>
	.container {
		max-width: 800px;
		margin: 2rem auto;
		padding: 1.5rem;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
			Oxygen, Ubuntu, Cantarell, sans-serif;
	}

	section {
		margin: 1.5rem 0;
		padding: 1rem;
		background: #f5f5f5;
		border-radius: 0.5rem;
	}

	h2,
	h3 {
		margin-top: 0;
	}

	.explanation {
		margin: 1.5rem 0;
		padding: 1rem;
		background: #fff3e0;
		border-radius: 0.5rem;
	}

	.explanation ol {
		margin: 0.5rem 0 0 0;
		padding-left: 1.5rem;
	}

	.explanation li {
		margin: 0.25rem 0;
	}

	.note {
		margin-top: 2rem;
		padding: 1rem;
		background: #e3f2fd;
		border-left: 4px solid #2196f3;
		border-radius: 0.25rem;
	}
