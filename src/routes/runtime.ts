import { Effect, Layer, Logger, LogLevel, ManagedRuntime } from "effect";
import { createRunner } from "../lib/runner.ts";

const MainLayer = Layer.mergeAll(
	Logger.pretty,
	Logger.minimumLogLevel(LogLevel.Debug),
);

export const RuntimeServer = ManagedRuntime.make(MainLayer);
export type RuntimeServerContext = ManagedRuntime.ManagedRuntime.Context<
	typeof RuntimeServer
>;

export const remoteRunner = createRunner({
	after: () => Effect.logInfo("Stopping operation"),
	before: () => Effect.logInfo("Starting operation"),
	onError: (error, isUnexpectedError) =>
		isUnexpectedError
			? Effect.logError(`Unexpected error: ${error}`)
			: Effect.logWarning(`Expected control flow error: ${error}`),
	runtime: RuntimeServer,
});
