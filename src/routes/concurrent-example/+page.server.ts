import { Effect } from "effect";
import { remoteRunner } from "../runtime.ts";

export async function load() {
	return remoteRunner(
		"load-dashboard-data",
		Effect.gen(function* () {
			yield* Effect.logInfo("Loading dashboard data");

			// Run multiple operations in parallel - creates nested spans
			const [user, posts, stats] = yield* Effect.all(
				[
					fetchUser().pipe(Effect.withSpan("fetch-user")),
					fetchPosts().pipe(Effect.withSpan("fetch-posts")),
					fetchStats().pipe(Effect.withSpan("fetch-stats")),
				],
				{ concurrency: "unbounded" },
			);

			yield* Effect.logDebug("All data loaded successfully", {
				postCount: posts.length,
				statsCount: stats.length,
				userCount: 1,
			});

			return { posts, stats, user };
		}),
	);
}

function fetchUser() {
	return Effect.gen(function* () {
		yield* Effect.logDebug("Fetching user details");
		yield* Effect.sleep(200);
		return { id: 1, name: "John" };
	});
}

function fetchPosts() {
	return Effect.gen(function* () {
		yield* Effect.logDebug("Fetching user posts");
		yield* Effect.sleep(500);
		return [
			{ id: 1, title: "Post 1" },
			{ id: 2, title: "Post 2" },
		];
	});
}

function fetchStats() {
	return Effect.gen(function* () {
		yield* Effect.logDebug("Fetching statistics");
		yield* Effect.sleep(300);
		return { likes: 50, views: 1000 };
	});
}
