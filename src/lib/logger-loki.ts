import { Effect } from "effect";

export const logToLoki = (message: unknown, annotation: string) =>
	Effect.promise(async () => {
		const timestamp = Date.now() * 1000000;
		const payload = {
			streams: [
				{
					stream: {
						environment: "dev",
						service: "databao-platform-dev",
						severity: annotation,
					},
					values: [[timestamp, JSON.stringify({ annotation, message })]],
				},
			],
		};
		const response = await fetch("http://localhost:3100/loki/api/v1/push", {
			body: JSON.stringify(payload),
			headers: {
				"Content-Type": "application/json",
			},
			method: "POST",
		});
		if (!response.ok) {
			throw new Error(`Failed to send log to Loki: ${response.statusText}`);
		}
	}).pipe(
		Effect.catchAll((e) => Effect.logError(`Failed to send log to Loki: ${e}`)),
	);
