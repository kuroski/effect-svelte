# effect-svelte

Integration library for [Effect](https://effect.website/) with [SvelteKit](https://kit.svelte.dev/). Run Effect programs in SvelteKit load functions and remote functions with automatic error handling, redirects, and form validation.

## Installation

```sh
npm add effect-svelte
# or
bun add effect-svelte
```

**Peer dependencies:** `effect >=3.19.15`, `svelte >=5`, `@sveltejs/kit >=2`

## Quick Start

### 1. Create a Runner

```ts
// src/lib/server/runtime.ts
import { Effect, Layer, ManagedRuntime } from "effect";
import { createRunner } from "effect-svelte";

const AppLayer = Layer.mergeAll(
  // your service layers
);

const RuntimeServer = ManagedRuntime.make(AppLayer);

export const remoteRunner = createRunner({
  runtime: RuntimeServer,
  before: () => Effect.log("Starting operation"),
  after: () => Effect.log("Operation completed"),
  onError: (err, isUnexpectedError) =>
    isUnexpectedError
      ? Effect.logError("Operation failed", err)
      : Effect.void,
});
```

### 2. Use in Load Functions

The runner works directly inside SvelteKit `load` functions. Call it with an operation name, your Effect program, and an optional error-mapping pipeline:

```ts
// src/routes/posts/+page.server.ts
import { Effect } from "effect";
import { httpErrorEffect } from "effect-svelte";
import { remoteRunner } from "$lib/server/runtime";

export async function load({ params }) {
  return remoteRunner(
    "load-posts",
    Effect.gen(function* () {
      const posts = yield* fetchPosts();

      if (posts.length === 0) {
        yield* httpErrorEffect(404, "NOT_FOUND", "No posts found");
      }

      return { posts };
    }),
  );
}
```

```svelte
<!-- src/routes/posts/+page.svelte -->
<script lang="ts">
  let { data } = $props();
</script>

<ul>
  {#each data.posts as post (post.id)}
    <li>{post.title}</li>
  {/each}
</ul>
```

### 3. Use in Remote Functions

The same runner works with SvelteKit's experimental [remote functions](https://svelte.dev/docs/kit/remote-functions):

```ts
// src/routes/posts.remote.ts
import { Effect } from "effect";
import { query } from "$app/server";
import { remoteRunner } from "$lib/server/runtime";

export const getPosts = query(() =>
  remoteRunner(
    "get-posts",
    Effect.gen(function* () {
      yield* Effect.logInfo("Fetching posts");
      return { posts: [{ id: 1, title: "Hello" }] };
    }),
  ),
);
```

```svelte
<!-- src/routes/+page.svelte -->
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
    {/each}
  </ul>
</svelte:boundary>
```

## Error Handling

The library provides three tagged error types that map to SvelteKit's control flow:

```ts
import { Effect } from "effect";
import {
  SvelteKitRedirect,
  SvelteKitHttpError,
  SvelteKitInvalidError,
  redirectEffect,
  httpErrorEffect,
  invalidEffect,
} from "effect-svelte";

Effect.gen(function* () {
  // Redirect (throws SvelteKit redirect())
  yield* redirectEffect(303, "/login");
  // or: yield* Effect.fail(SvelteKitRedirect.make(303, "/login"));

  // HTTP error (throws SvelteKit error())
  yield* httpErrorEffect(404, "NOT_FOUND", "Resource not found");
  // or: yield* Effect.fail(SvelteKitHttpError.make(404, "NOT_FOUND", "Not found"));

  // Form validation error (throws SvelteKit invalid())
  yield* invalidEffect("email", "Invalid email format");
  // or: yield* Effect.fail(SvelteKitInvalidError.make({ email: "Invalid" }));
});
```

### Pipeline for Error Mapping

Use the third argument of the runner to map domain errors to SvelteKit errors:

```ts
export const listProjects = remoteRunner(
  "listProjects",
  Effect.gen(function* () {
    const service = yield* ProjectService;
    return yield* service.all();
  }),
  (effect) =>
    effect.pipe(
      Effect.catchTags({
        ParseError: () =>
          httpErrorEffect(500, "PARSE_ERROR", "Unexpected data from the server"),
        ResponseError: () =>
          httpErrorEffect(500, "GENERIC_ERROR", "Unexpected server response"),
      }),
    ),
);
```

## API Reference

### `createRunner(options)`

Creates a runner function that executes Effect programs in a SvelteKit context.

**Options:**

| Option | Type | Description |
|--------|------|-------------|
| `runtime` | `ManagedRuntime<R, never>` | The Effect runtime to use |
| `before` | `() => Effect<void>` | Runs before the effect |
| `after` | `(result: A) => Effect<void>` | Runs after successful execution |
| `onError` | `(err, isUnexpectedError) => Effect<void>` | Error handler. `isUnexpectedError` is `true` for 500+ errors and unrecognized failures, `false` for redirects, validation errors, and <500 HTTP errors |

**Returns:** `Runner<R>` - a function with signature:

```ts
(operationName: string, effect: Effect<A, E, R>, pipeline?: PipelineFn<R>) => Promise<A>
```

**Execution order:** `before` → `effect` → `pipeline` → `onError` (on failure) → `after` (on success) → `withSpan(operationName)`

### Error Types

| Class | Converts to | Factory |
|-------|-------------|---------|
| `SvelteKitRedirect` | `redirect(status, location)` | `SvelteKitRedirect.make(status, location)` |
| `SvelteKitHttpError` | `error(status, body)` | `SvelteKitHttpError.make(status, code, message, details?)` |
| `SvelteKitInvalidError` | `invalid(issues)` | `SvelteKitInvalidError.make(issues)` |

### Convenience Functions

| Function | Description |
|----------|-------------|
| `redirectEffect(status, location)` | Returns `Effect.fail(SvelteKitRedirect.make(...))` |
| `httpErrorEffect(status, code, message, details?)` | Returns `Effect.fail(SvelteKitHttpError.make(...))` |
| `invalidEffect(issues)` | Returns `Effect.fail(SvelteKitInvalidError.make(...))` |

### `SvelteEffect.Code`

Error code type: `"GENERIC_ERROR" | "PARSE_ERROR" | "NOT_FOUND" | "UNAUTHORIZED"`

## License

MIT
