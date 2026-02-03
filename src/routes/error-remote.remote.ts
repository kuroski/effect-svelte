import { Effect } from "effect";
import { query } from "$app/server";
import { remoteRunner } from "./runtime.ts";

export const getErrorPosts = query(() =>
	remoteRunner(
		"remote-function-error",
		Effect.gen(function* () {
			yield* Effect.logInfo("Simulating error in remote function");

			yield* Effect.sleep(500);

			const shouldFail = true;

			if (shouldFail) {
				yield* Effect.dieMessage("External API timeout in remote function");
			}

			return {
				posts: [{ body: "Body 1", id: 1, title: "Post 1" }],
			};
		}),
	),
);
