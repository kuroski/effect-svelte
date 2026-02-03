<script lang="ts">
	let { data } = $props();
</script>

<div class="container">
	<h1>Log Levels Test</h1>

	<div class="levels">
		<div class="level debug">
			<strong>DEBUG</strong> - Verbose debug information for developers
		</div>
		<div class="level info">
			<strong>INFO</strong> - Starting data processing / Processing complete
		</div>
		<div class="level warning">
			<strong>WARNING</strong> - Deprecated API usage detected
		</div>
	</div>

	<section>
		<h2>Processed Data</h2>
		<ul>
			{#each data.data as record (record.id)}
				<li>{record.value}</li>
			{/each}
		</ul>
		<p class="count">Total records: {data.data.length}</p>
	</section>

	<p class="note">
		Check the console and Grafana logs to see different log levels. You should
		see Debug, Info, and Warning entries with proper severity classification.
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

	.levels {
		margin: 1.5rem 0;
	}

	.level {
		padding: 0.75rem;
		margin: 0.5rem 0;
		border-radius: 0.25rem;
		border-left: 4px solid;
	}

	.level.debug {
		background: #f3e5f5;
		border-color: #9c27b0;
	}

	.level.info {
		background: #e3f2fd;
		border-color: #2196f3;
	}

	.level.warning {
		background: #fff3e0;
		border-color: #ff9800;
	}

	section {
		margin: 1.5rem 0;
		padding: 1rem;
		background: #f5f5f5;
		border-radius: 0.5rem;
	}

	h2 {
		margin-top: 0;
	}

	.count {
		margin-top: 1rem;
		font-weight: 600;
	}

	.note {
		margin-top: 2rem;
		padding: 1rem;
		background: #e8f5e9;
		border-left: 4px solid #4caf50;
		border-radius: 0.25rem;
	}
