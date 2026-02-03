import { Effect, Schedule } from "effect";
import { httpErrorEffect } from "../../lib/errors.ts";
import { remoteRunner } from "../runtime.ts";

let attemptCount = 0;

export async function load() {
	// Reset attempt count on each load
	attemptCount = 0;

	return remoteRunner(
		"fetch-with-timeout-retry",
		Effect.gen(function* () {
			yield* Effect.logInfo("Fetching data with timeout and retry");

			// Retry up to 3 times with exponential backoff
			const data = yield* fetchUnreliableApi().pipe(
				Effect.timeout("2 seconds"),
				Effect.retry(
					Schedule.exponential("100 millis").pipe(
						Schedule.compose(Schedule.recurs(2)),
					),
				),
				Effect.catchTag("TimeoutException", () =>
					Effect.gen(function* () {
						yield* Effect.logError("All retry attempts exhausted");
						return yield* httpErrorEffect(
							504,
							"GENERIC_ERROR",
							"Gateway timeout after retries",
							{
								attempts: attemptCount,
								maxRetries: 3,
							},
						);
					}),
				),
			);

			return { data };
		}),
	);
}

function fetchUnreliableApi() {
	return Effect.gen(function* () {
		attemptCount++;
		yield* Effect.logDebug(`API call attempt ${attemptCount}`);
		yield* Effect.sleep(500);

		// Fail first 2 attempts
		if (attemptCount < 3) {
			yield* Effect.logWarning(`Attempt ${attemptCount} failed, will retry...`);
			yield* Effect.dieMessage("Temporary API failure");
		}

		yield* Effect.logInfo(`Attempt ${attemptCount} succeeded`);
		return { attemptCount, result: "success" };
	});
}
