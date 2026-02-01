import { Effect } from "effect";
import { httpErrorEffect } from "../../lib/errors.ts";
import { remoteRunner } from "../runtime.ts";

export async function load() {
	return remoteRunner(
		"load-posts",
		Effect.gen(function* () {
			yield* Effect.logInfo("Loading posts via load function");
			yield* Effect.sleep(1_000);

			const posts = [
				{ body: "Body 1", id: 1, title: "Post 1" },
				{ body: "Body 2", id: 2, title: "Post 2" },
			];

			if (posts.length === 0) {
				yield* httpErrorEffect(404, "NOT_FOUND", "No posts found");
			}

			return { posts };
		}),
	);
}
