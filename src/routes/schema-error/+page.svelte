<script lang="ts">
	let { data } = $props();
</script>

<div class="container">
	<h1>Schema Parsing Error</h1>
	{#if data.user}
		<p>User parsed successfully: {data.user.name}</p>
	{:else}
		<p>No user data</p>
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
