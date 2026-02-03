import { Effect, Schema } from "effect";
import { remoteRunner } from "../runtime.ts";

const UserSchema = Schema.Struct({
	email: Schema.String,
	name: Schema.String,
});

export async function load() {
	return remoteRunner(
		"schema-parsing-error",
		Effect.gen(function* () {
			yield* Effect.logInfo("Attempting to parse invalid user data");

			const invalidData: unknown = {
				email: 123,
				name: true,
			};

			const user = yield* Schema.decodeUnknown(UserSchema)(invalidData);

			return { user };
		}),
	);
}
