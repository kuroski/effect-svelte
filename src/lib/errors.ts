import type { HttpError, invalid, Redirect } from "@sveltejs/kit";
import { Data, Effect } from "effect";

// ---------------------------------------------------------------------------
// Error body types
// ---------------------------------------------------------------------------

export namespace SvelteEffect {
	export type Code =
		| "GENERIC_ERROR"
		| "PARSE_ERROR"
		| "NOT_FOUND"
		| "UNAUTHORIZED";

	export interface ErrorBody {
		code: Code;
		details?: Record<string, unknown>;
		message: string;
		timestamp: string;
	}
}

export class SvelteKitError extends Error implements SvelteEffect.ErrorBody {
	declare code: SvelteEffect.Code;
	declare details?: Record<string, unknown>;
	declare timestamp: string;

	constructor(
		message: string,
		code: SvelteEffect.Code,
		details?: Record<string, unknown>,
	) {
		super(message);
		this.name = "SvelteKitError";
		this.code = code;
		this.details = details;
		this.timestamp = new Date().toISOString();
	}
}

// ---------------------------------------------------------------------------
// Tagged errors (used inside Effect programs)
// ---------------------------------------------------------------------------

/**
 * Tagged error representing a SvelteKit redirect.
 *
 * When handled by the runner it is converted to a thrown SvelteKit `redirect()`.
 */
export class SvelteKitRedirect extends Data.TaggedError("SvelteKitRedirect")<{
	readonly status: Redirect["status"];
	readonly location: string;
}> {
	static make(status: Redirect["status"], location: string) {
		return new SvelteKitRedirect({ location, status });
	}
}

/**
 * Tagged error representing a SvelteKit HTTP error.
 *
 * When handled by the runner it is converted to a thrown SvelteKit `error()`.
 */
export class SvelteKitHttpError extends Data.TaggedError("SvelteKitHttpError")<{
	readonly status: HttpError["status"];
	readonly body: {
		code: SvelteEffect.Code;
		details?: Record<string, unknown> | undefined;
		message: string;
		timestamp: string;
	};
}> {
	static make(
		status: HttpError["status"],
		code: SvelteEffect.Code,
		message: string,
		details?: Record<string, unknown> | undefined,
	) {
		return new SvelteKitHttpError({
			body: {
				code,
				details,
				message,
				timestamp: new Date().toISOString(),
			},
			status,
		});
	}
}

/**
 * Tagged error representing SvelteKit form validation errors.
 *
 * When handled by the runner it is converted to a thrown SvelteKit `invalid()`.
 */
export class SvelteKitInvalidError extends Data.TaggedError(
	"SvelteKitInvalidError",
)<{
	readonly issues: Parameters<typeof invalid>;
}> {
	static make(...issues: Parameters<typeof invalid>) {
		return new SvelteKitInvalidError({ issues });
	}
}

// ---------------------------------------------------------------------------
// Convenience effect constructors
// ---------------------------------------------------------------------------

export function redirectEffect(
	status: Redirect["status"],
	location: string,
): Effect.Effect<never, SvelteKitRedirect> {
	return Effect.fail(SvelteKitRedirect.make(status, location));
}

export function httpErrorEffect(
	status: HttpError["status"],
	code: SvelteEffect.Code,
	message: string,
	details?: Record<string, unknown>,
): Effect.Effect<never, SvelteKitHttpError> {
	return Effect.fail(SvelteKitHttpError.make(status, code, message, details));
}

export function invalidEffect(
	...issues: [field: string, message: string] | [Record<string, string>]
): Effect.Effect<never, SvelteKitInvalidError> {
	return Effect.fail(
		SvelteKitInvalidError.make(...(issues as Parameters<typeof invalid>)),
	);
}
