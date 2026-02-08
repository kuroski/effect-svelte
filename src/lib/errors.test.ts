import { Cause, Effect, Exit, Option } from "effect";
import { describe, expect, it } from "vitest";
import {
	httpErrorEffect,
	invalidEffect,
	redirectEffect,
	SvelteKitHttpError,
	SvelteKitInvalidError,
	SvelteKitRedirect,
} from "./errors.js";

describe("redirectEffect", () => {
	it("returns a failed effect with SvelteKitRedirect", async () => {
		const exit = await Effect.runPromiseExit(redirectEffect(303, "/login"));
		expect(Exit.isFailure(exit)).toBe(true);

		const error = extractFailure(exit);
		expect(error).toBeInstanceOf(SvelteKitRedirect);
		expect(error).toMatchInlineSnapshot(`[SvelteKitRedirect: [303] → /login]`);
	});
});

describe("httpErrorEffect", () => {
	it("returns a failed effect with SvelteKitHttpError", async () => {
		const exit = await Effect.runPromiseExit(
			httpErrorEffect(404, "NOT_FOUND", "Not found"),
		);
		expect(Exit.isFailure(exit)).toBe(true);

		const error = extractFailure(exit);
		expect(error).toBeInstanceOf(SvelteKitHttpError);
		expect(error).toMatchInlineSnapshot(
			`[SvelteKitHttpError: [404] NOT_FOUND: Not found]`,
		);
	});
});

describe("invalidEffect", () => {
	it("returns a failed effect with SvelteKitInvalidError", async () => {
		const exit = await Effect.runPromiseExit(invalidEffect({ email: "bad" }));
		expect(Exit.isFailure(exit)).toBe(true);

		const error = extractFailure(exit);
		expect(error).toBeInstanceOf(SvelteKitInvalidError);
		expect(error).toMatchInlineSnapshot(
			`[SvelteKitInvalidError: Validation failed: [{"email":"bad"}]]`,
		);
	});
});

function extractFailure<A, E>(exit: Exit.Exit<A, E>): E | undefined {
	if (Exit.isFailure(exit)) {
		return Option.getOrUndefined(Cause.failureOption(exit.cause));
	}
	return undefined;
}
