import { Effect } from "effect";
import { invalidEffect } from "../../lib/errors.ts";
import { remoteRunner } from "../runtime.ts";
import type { Actions } from "./$types.js";

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;
		const confirmPassword = formData.get("confirmPassword") as string;

		return remoteRunner(
			"validate-registration-form",
			Effect.gen(function* () {
				yield* Effect.logInfo("Validating registration form");

				const errors: Record<string, string> = {};

				// Email validation
				if (!email || email.trim() === "") {
					errors.email = "Email is required";
				} else if (!email.includes("@")) {
					errors.email = "Email must be valid";
				}

				// Password validation
				if (!password || password.length < 8) {
					errors.password = "Password must be at least 8 characters";
				}

				// Confirm password validation
				if (password !== confirmPassword) {
					errors.confirmPassword = "Passwords do not match";
				}

				if (Object.keys(errors).length > 0) {
					yield* Effect.logWarning("Form validation failed", {
						fieldCount: Object.keys(errors).length,
						fields: Object.keys(errors),
					});
					yield* invalidEffect(errors);
				}

				yield* Effect.logInfo("Registration successful");
				return { success: true };
			}),
		);
	},
} satisfies Actions;
