<script lang="ts">
	let { data } = $props();
</script>

<div class="container">
	<h1>Redirect Example</h1>
	<p>You should never see this - redirect should happen in load function</p>
	{#if data.user}
		<p>Logged in as: {data.user.name}</p>
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
