<script lang="ts">
	import { getPosts } from "./posts.remote.ts";
</script>

<svelte:boundary>
    {#snippet pending()}
        <p>loading...</p>
    {/snippet}

    {#snippet failed(error)}
        <span>Error: {error}</span>
    {/snippet}

    {@const { posts } = await getPosts()}
    <ul>
        {#each posts as post (post.id)}
            <li>{post.title}</li>
        {:else}
            <li>No posts found</li>
        {/each}
    </ul>
</svelte:boundary>
