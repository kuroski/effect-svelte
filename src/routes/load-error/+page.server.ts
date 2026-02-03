import { Effect } from "effect";
import { remoteRunner } from "../runtime.ts";

export async function load() {
	return remoteRunner(
		"load-function-error",
		Effect.gen(function* () {
			yield* Effect.logInfo("Simulating error in load function");

			yield* Effect.sleep(500);

			const shouldFail = true;

			if (shouldFail) {
				yield* Effect.dieMessage("Database connection failed in load function");
			}

			return { data: "This should never be reached" };
		}),
	);
}
