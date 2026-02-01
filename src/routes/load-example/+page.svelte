<script lang="ts">
	let { data } = $props();
</script>

<h1>Load Function Example</h1>
<ul>
	{#each data.posts as post (post.id)}
		<li>{post.title}</li>
	{:else}
		<li>No posts found</li>
	{/each}
</ul>
