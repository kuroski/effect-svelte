import { Effect } from "effect";
import { query } from "$app/server";
import { remoteRunner } from "./runtime.ts";

export const getPosts = query(() =>
	remoteRunner(
		"get-posts",
		Effect.gen(function* () {
			yield* Effect.logInfo("Fetching posts");
			yield* Effect.sleep(3_000);
			return {
				posts: [
					{ body: "Body 1", id: 1, title: "Post 1" },
					{ body: "Body 2", id: 2, title: "Post 2" },
				],
			};
		}),
	),
);
