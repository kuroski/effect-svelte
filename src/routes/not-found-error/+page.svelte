<script lang="ts">
	let { data } = $props();
</script>

<div class="container">
	<h1>404 Not Found Error (Expected)</h1>
	{#if data.user}
		<p>User found: {data.user.name}</p>
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
