import { Effect } from "effect";
import { remoteRunner } from "../runtime.ts";

export async function load() {
	return remoteRunner(
		"test-log-levels",
		Effect.gen(function* () {
			yield* Effect.logDebug("Verbose debug information for developers");
			yield* Effect.logInfo("Starting data processing");
			yield* Effect.logWarning("Deprecated API usage detected");

			const data = yield* processData();

			yield* Effect.logInfo("Processing complete", {
				recordsProcessed: data.length,
			});

			return { data };
		}),
	);
}

function processData() {
	return Effect.gen(function* () {
		yield* Effect.logDebug("Processing individual records");
		yield* Effect.sleep(100);

		const records = [
			{ id: 1, value: "Record 1" },
			{ id: 2, value: "Record 2" },
			{ id: 3, value: "Record 3" },
		];

		for (const record of records) {
			yield* Effect.logDebug(`Processing record ${record.id}`, {
				recordId: record.id,
			});
		}

		return records;
	});
}
