import { error, invalid, redirect } from "@sveltejs/kit";
import {
	Cause,
	Effect,
	Exit,
	Function,
	type ManagedRuntime,
	Match,
	Option,
} from "effect";
import {
	SvelteKitError,
	SvelteKitHttpError,
	SvelteKitInvalidError,
	SvelteKitRedirect,
} from "./errors.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RunnerOptions<R> {
	runtime: ManagedRuntime.ManagedRuntime<R, never>;
	before?: () => Effect.Effect<void>;
	after?: <A>(result: A) => Effect.Effect<void>;
	onError?: (err: unknown, isUnexpectedError: boolean) => Effect.Effect<void>;
}

export type PipelineFn<A, E, R> = (
	effect: Effect.Effect<A, E, R>,
) => Effect.Effect<A, E, R>;

export type Runner<R> = <A, E>(
	operationName: string,
	effect: Effect.Effect<A, E, R>,
	pipeline?: PipelineFn<A, E, R>,
) => Promise<A>;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function isUnexpectedError(err: unknown): boolean {
	if (err instanceof SvelteKitRedirect) return false;
	if (err instanceof SvelteKitInvalidError) return false;
	if (err instanceof SvelteKitHttpError && err.status < 500) return false;
	return true;
}

function handleExit<A>(exit: Exit.Exit<A, unknown>): A {
	return Exit.match(exit, {
		onFailure: (cause) =>
			Function.pipe(
				Cause.failureOption(cause),
				Option.match({
					onNone: () => {
						console.error("Unhandled Effect error:", Cause.pretty(cause));
						throw error(
							500,
							SvelteKitError.make("Internal Server Error", "GENERIC_ERROR"),
						);
					},
					onSome: (failure) =>
						Match.value(failure).pipe(
							Match.when(Match.instanceOf(SvelteKitRedirect), (err) => {
								throw redirect(err.status, err.location);
							}),
							Match.when(Match.instanceOf(SvelteKitHttpError), (err) => {
								throw error(
									err.status,
									SvelteKitError.make(
										err.body.message,
										err.body.code,
										err.body.details,
									),
								);
							}),
							Match.when(Match.instanceOf(SvelteKitInvalidError), (err) => {
								throw invalid(...err.issues);
							}),
							Match.orElse(() => {
								console.error("Unhandled Effect error:", Cause.pretty(cause));
								throw error(
									500,
									SvelteKitError.make("Internal Server Error", "GENERIC_ERROR"),
								);
							}),
						),
				}),
			),
		onSuccess: Function.identity,
	});
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function createRunner<R>(options: RunnerOptions<R>): Runner<R> {
	return async function remoteRunner<A, E>(
		operationName: string,
		effect: Effect.Effect<A, E, R>,
		pipeline?: PipelineFn<A, E, R>,
	): Promise<A> {
		let program = options.before
			? Effect.zipRight(options.before(), effect)
			: effect;

		if (pipeline) {
			program = pipeline(program);
		}

		program = program.pipe(
			Effect.tapError((err) => {
				if (!options.onError) return Effect.void;
				return options.onError(err, isUnexpectedError(err));
			}),
		);

		if (options.after) {
			program = program.pipe(Effect.tap(options.after));
		}

		const exit = await options.runtime.runPromiseExit(
			program.pipe(Effect.withSpan(operationName)),
		);
		return handleExit(exit);
	};
}
