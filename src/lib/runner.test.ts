import { Effect, Layer, ManagedRuntime } from "effect";
import { afterAll, describe, expect, it, vi } from "vitest";
import {
	SvelteKitHttpError,
	SvelteKitInvalidError,
	SvelteKitRedirect,
} from "./errors.js";
import { createRunner } from "./runner.js";

// ---------------------------------------------------------------------------
// Mock @sveltejs/kit — its error/redirect/invalid functions throw special
// objects that SvelteKit catches internally. We simulate that here.
// ---------------------------------------------------------------------------

class MockRedirect {
	status: number;
	location: string;
	constructor(status: number, location: string) {
		this.status = status;
		this.location = location;
	}
}

class MockHttpError {
	status: number;
	body: unknown;
	constructor(status: number, body: unknown) {
		this.status = status;
		this.body = body;
	}
}

class MockValidationError extends Error {
	issues: unknown[];
	constructor(issues: unknown[]) {
		super("Validation failed");
		this.name = "ValidationError";
		this.issues = issues;
	}
}

vi.mock("@sveltejs/kit", () => ({
	error: (status: number, body: unknown) => {
		throw new MockHttpError(status, body);
	},
	invalid: (...issues: unknown[]) => {
		throw new MockValidationError(
			issues.map((i) => (typeof i === "string" ? { message: i } : i)),
		);
	},
	redirect: (status: number, location: string) => {
		throw new MockRedirect(status, location);
	},
}));

// ---------------------------------------------------------------------------
// Shared runtime
// ---------------------------------------------------------------------------

const TestRuntime = ManagedRuntime.make(Layer.empty);

afterAll(() => TestRuntime.dispose());

// ---------------------------------------------------------------------------
// createRunner
// ---------------------------------------------------------------------------

describe("createRunner", () => {
	it("returns the effect's success value", async () => {
		const run = createRunner({ runtime: TestRuntime });
		const result = await run("test-op", Effect.succeed(42));
		expect(result).toBe(42);
	});

	it("converts SvelteKitRedirect to a thrown SvelteKit redirect", async () => {
		const run = createRunner({ runtime: TestRuntime });

		try {
			await run(
				"redirect-op",
				Effect.fail(SvelteKitRedirect.make(303, "/login")),
			);
			expect.unreachable("should have thrown");
		} catch (thrown) {
			expect(thrown).toBeInstanceOf(MockRedirect);
			expect(thrown).toMatchInlineSnapshot(`
				MockRedirect {
				  "location": "/login",
				  "status": 303,
				}
			`);
		}
	});

	it("converts SvelteKitHttpError to a thrown SvelteKit error", async () => {
		const run = createRunner({ runtime: TestRuntime });

		try {
			await run(
				"http-error-op",
				Effect.fail(SvelteKitHttpError.make(404, "NOT_FOUND", "Not found")),
			);
			expect.unreachable("should have thrown");
		} catch (thrown) {
			expect(thrown).toBeInstanceOf(MockHttpError);
			expect(thrown).toMatchInlineSnapshot(`
				MockHttpError {
				  "body": [SvelteKitError: Not found],
				  "status": 404,
				}
			`);
		}
	});

	it("converts SvelteKitInvalidError to a thrown SvelteKit invalid", async () => {
		const run = createRunner({ runtime: TestRuntime });

		try {
			await run(
				"invalid-op",
				Effect.fail(SvelteKitInvalidError.make("Invalid email")),
			);
			expect.unreachable("should have thrown");
		} catch (thrown) {
			expect(thrown).toBeInstanceOf(MockValidationError);
		}
	});

	it("throws a 500 error for unhandled failures", async () => {
		const run = createRunner({ runtime: TestRuntime });

		try {
			await run("unknown-op", Effect.fail("some random error"));
			expect.unreachable("should have thrown");
		} catch (thrown) {
			expect(thrown).toBeInstanceOf(MockHttpError);
			expect(thrown).toMatchInlineSnapshot(`
				MockHttpError {
				  "body": [SvelteKitError: Internal Server Error],
				  "status": 500,
				}
			`);
		}
	});

	it("throws a 500 error for defects (die)", async () => {
		const run = createRunner({ runtime: TestRuntime });

		try {
			await run("defect-op", Effect.die("boom"));
			expect.unreachable("should have thrown");
		} catch (thrown) {
			expect(thrown).toBeInstanceOf(MockHttpError);
			expect(thrown).toMatchInlineSnapshot(`
				MockHttpError {
				  "body": [SvelteKitError: Internal Server Error],
				  "status": 500,
				}
			`);
		}
	});
});

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

describe("before hook", () => {
	it("runs before the main effect", async () => {
		const order: string[] = [];

		const run = createRunner({
			before: () =>
				Effect.sync(() => {
					order.push("before");
				}),
			runtime: TestRuntime,
		});

		await run(
			"before-op",
			Effect.sync(() => {
				order.push("effect");
				return "ok";
			}),
		);

		expect(order).toEqual(["before", "effect"]);
	});
});

describe("after hook", () => {
	it("runs after a successful effect", async () => {
		const order: string[] = [];

		const run = createRunner({
			after: () =>
				Effect.sync(() => {
					order.push("after");
				}),
			runtime: TestRuntime,
		});

		await run(
			"after-op",
			Effect.sync(() => {
				order.push("effect");
				return "ok";
			}),
		);

		expect(order).toEqual(["effect", "after"]);
	});

	it("does not run after a failed effect", async () => {
		const afterCalled = vi.fn();

		const run = createRunner({
			after: () => Effect.sync(afterCalled),
			runtime: TestRuntime,
		});

		try {
			await run("after-fail-op", Effect.fail("error"));
		} catch {
			// expected
		}

		expect(afterCalled).not.toHaveBeenCalled();
	});
});

describe("onError hook", () => {
	it("is called with isUnexpectedError=false for SvelteKitRedirect", async () => {
		const onError = vi.fn(() => Effect.void);

		const run = createRunner({ onError, runtime: TestRuntime });

		try {
			await run(
				"onerror-redirect",
				Effect.fail(SvelteKitRedirect.make(303, "/login")),
			);
		} catch {
			// expected
		}

		expect(onError).toHaveBeenCalledWith(expect.any(SvelteKitRedirect), false);
	});

	it("is called with isUnexpectedError=false for SvelteKitInvalidError", async () => {
		const onError = vi.fn(() => Effect.void);

		const run = createRunner({ onError, runtime: TestRuntime });

		try {
			await run(
				"onerror-invalid",
				Effect.fail(SvelteKitInvalidError.make("bad")),
			);
		} catch {
			// expected
		}

		expect(onError).toHaveBeenCalledWith(
			expect.any(SvelteKitInvalidError),
			false,
		);
	});

	it("is called with isUnexpectedError=false for <500 SvelteKitHttpError", async () => {
		const onError = vi.fn(() => Effect.void);

		const run = createRunner({ onError, runtime: TestRuntime });

		try {
			await run(
				"onerror-404",
				Effect.fail(SvelteKitHttpError.make(404, "NOT_FOUND", "Missing")),
			);
		} catch {
			// expected
		}

		expect(onError).toHaveBeenCalledWith(expect.any(SvelteKitHttpError), false);
	});

	it("is called with isUnexpectedError=true for 500 SvelteKitHttpError", async () => {
		const onError = vi.fn(() => Effect.void);

		const run = createRunner({ onError, runtime: TestRuntime });

		try {
			await run(
				"onerror-500",
				Effect.fail(
					SvelteKitHttpError.make(500, "GENERIC_ERROR", "Server error"),
				),
			);
		} catch {
			// expected
		}

		expect(onError).toHaveBeenCalledWith(expect.any(SvelteKitHttpError), true);
	});

	it("is called with isUnexpectedError=true for unknown errors", async () => {
		const onError = vi.fn(() => Effect.void);

		const run = createRunner({ onError, runtime: TestRuntime });

		try {
			await run("onerror-unknown", Effect.fail("unknown error"));
		} catch {
			// expected
		}

		expect(onError).toHaveBeenCalledWith("unknown error", true);
	});
});

// ---------------------------------------------------------------------------
// Pipeline
// ---------------------------------------------------------------------------

describe("pipeline", () => {
	it("transforms the effect via the pipeline function", async () => {
		const run = createRunner({ runtime: TestRuntime });

		const result = await run("pipeline-op", Effect.succeed(10), (effect) =>
			effect.pipe(Effect.map((n) => n * 2)),
		);

		expect(result).toBe(20);
	});

	it("can add error handling middleware", async () => {
		const errors: unknown[] = [];
		const run = createRunner({ runtime: TestRuntime });

		try {
			await run(
				"pipeline-tap-error",
				Effect.fail(SvelteKitHttpError.make(500, "GENERIC_ERROR", "Oops")),
				(effect) =>
					effect.pipe(
						Effect.tapError((err) =>
							Effect.sync(() => {
								errors.push(err);
							}),
						),
					),
			);
			expect.unreachable("should have thrown");
		} catch {
			// expected — runner converts unhandled errors to 500
		}

		expect(errors).toHaveLength(1);
		expect(errors[0]).toBeInstanceOf(SvelteKitHttpError);
	});
});
