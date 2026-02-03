import { NodeSdk } from "@effect/opentelemetry";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { Effect, Layer, Logger, LogLevel, ManagedRuntime } from "effect";
import { env } from "$env/dynamic/private";
import { createRunner } from "../lib/runner.ts";

const MainLayer = Layer.mergeAll(
	Logger.json,
	Logger.minimumLogLevel(LogLevel.Debug),
	Logger.minimumLogLevel(LogLevel.Debug),
	NodeSdk.layer(() => ({
		resource: {
			serviceName: "databao-platform-dev",
			serviceVersion: env.npm_package_version ?? "0.0.1",
		},
		spanProcessor: new BatchSpanProcessor(
			new OTLPTraceExporter({
				url: `${env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
			}),
		),
	})),
);

export const RuntimeServer = ManagedRuntime.make(
	MainLayer,
) as unknown as ManagedRuntime.ManagedRuntime<never, never>;
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
