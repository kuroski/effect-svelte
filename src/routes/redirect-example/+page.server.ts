import { Effect } from "effect";
import { redirectEffect } from "../../lib/errors.ts";
import { remoteRunner } from "../runtime.ts";

export async function load() {
	return remoteRunner(
		"check-auth-redirect",
		Effect.gen(function* () {
			yield* Effect.logInfo("Checking authentication");

			const isAuthenticated = false;

			if (!isAuthenticated) {
				yield* Effect.logWarning(
					"User not authenticated, redirecting to login",
				);
				yield* redirectEffect(303, "/errors");
			}

			return { user: { name: "Admin" } };
		}),
	);
}
