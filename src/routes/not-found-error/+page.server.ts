import { Effect } from "effect";
import { httpErrorEffect } from "../../lib/errors.ts";
import { remoteRunner } from "../runtime.ts";

export async function load() {
	return remoteRunner(
		"fetch-user-not-found",
		Effect.gen(function* () {
			yield* Effect.logInfo("Fetching user by ID");

			const userId = 999;
			const user = yield* fetchUser(userId);

			return { user };
		}),
	);
}

function fetchUser(id: number) {
	return Effect.gen(function* () {
		yield* Effect.sleep(300);

		// Simulate user not found - this is EXPECTED control flow
		if (id === 999) {
			yield* httpErrorEffect(404, "NOT_FOUND", "User not found", {
				searchedAt: new Date().toISOString(),
				userId: id,
			});
		}

		return { email: "john@example.com", id, name: "John Doe" };
	});
}
