<script lang="ts">
	let { data } = $props();
</script>

<div class="container">
	<h1>Concurrent Operations (Nested Spans)</h1>

	<section>
		<h2>User</h2>
		<p>Name: {data.user.name}</p>
		<p>ID: {data.user.id}</p>
	</section>

	<section>
		<h2>Posts</h2>
		<ul>
			{#each data.posts as post (post.id)}
				<li>{post.title}</li>
			{/each}
		</ul>
	</section>

	<section>
		<h2>Statistics</h2>
		<p>Views: {data.stats.views}</p>
		<p>Likes: {data.stats.likes}</p>
	</section>

	<p class="note">
		Check Grafana to see nested spans: fetch-user, fetch-posts, fetch-stats
		running in parallel
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

	h2 {
		margin-top: 0;
	}

	.note {
		margin-top: 2rem;
		padding: 1rem;
		background: #e3f2fd;
		border-left: 4px solid #2196f3;
		border-radius: 0.25rem;
	}
