<script lang="ts">
	let { data } = $props();
</script>

<div class="container">
	<h1>Load Function Error</h1>
	{#if data.data}
		<p>Data loaded: {data.data}</p>
	{:else}
		<p>No data loaded</p>
	{/if}
</div>

<style>
	.container {
		max-width: 800px;
		margin: 2rem auto;
		padding: 1.5rem;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
			Oxygen, Ubuntu, Cantarell, sans-serif;
	}
</style>
