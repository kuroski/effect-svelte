import { NodeSdk } from "@effect/opentelemetry";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { Effect, Layer, Logger, LogLevel, ManagedRuntime } from "effect";
import { env } from "$env/dynamic/private";
import { logToLoki } from "../lib/logger-loki.ts";
import { createRunner } from "../lib/runner.ts";

const MainLayer = Layer.mergeAll(
	Logger.json,
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

const logWithLoki = <A>(message: A, annotation: string) =>
	Effect.zipRight(
		Logger.log(message, annotation),
		logToLoki({ annotation, message }),
	);

export const RuntimeServer = ManagedRuntime.make(
	MainLayer,
) as unknown as ManagedRuntime.ManagedRuntime<never, never>;
export type RuntimeServerContext = ManagedRuntime.ManagedRuntime.Context<
	typeof RuntimeServer
>;

export const remoteRunner = createRunner({
	after: () => logWithLoki("Stopping operation", "Info"),
	before: () => logWithLoki("Starting operation", "Info"),
	onError: (error, isUnexpectedError) =>
		Effect.zipRight(
			isUnexpectedError
				? logWithLoki(`Unexpected error: ${error}`, "Error")
				: logWithLoki(`Expected control flow error: ${error}`, "Warning"),
		),
	runtime: RuntimeServer,
});
