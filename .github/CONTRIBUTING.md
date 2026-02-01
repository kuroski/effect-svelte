# Contributing to effect-svelte

Thanks for your interest in contributing! This guide covers the development workflow and release process.

## Getting started

```bash
# Clone the repo
git clone https://github.com/kuroski/effect-svelte.git
cd effect-svelte

# Install dependencies (this also sets up git hooks via husky)
bun install
```

## Development

```bash
bun run dev          # Start dev server
bun run build        # Build the library
bun run test         # Run tests once
bun run test:watch   # Run tests in watch mode
bun run check        # Type-check with svelte-check
bun run biome:check  # Lint and format (auto-fix)
bun run biome:ci     # Lint and format (check only)
```

## Commit conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/) to automate versioning and changelog generation via [semantic-release](https://github.com/semantic-release/semantic-release).

A git hook (commitlint) validates your commit messages on every commit. If a message doesn't follow the format, the commit will be rejected with an explanation.

### Format

```
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
```

### Common types

| Type | Description | Version bump |
|------|-------------|--------------|
| `feat` | A new feature | Minor (`0.1.0` -> `0.2.0`) |
| `fix` | A bug fix | Patch (`0.1.0` -> `0.1.1`) |
| `docs` | Documentation only | None |
| `style` | Formatting, missing semicolons, etc. | None |
| `refactor` | Code change that neither fixes a bug nor adds a feature | None |
| `perf` | Performance improvement | Patch |
| `test` | Adding or updating tests | None |
| `chore` | Maintenance tasks | None |

### Breaking changes

Append `!` after the type or add a `BREAKING CHANGE:` footer to trigger a major version bump:

```
feat!: remove deprecated createHandler API

BREAKING CHANGE: createHandler has been removed, use createRunner instead.
```

### Examples

```bash
git commit -m "feat: add timeout option to createRunner"
git commit -m "fix: handle missing error message in HttpError"
git commit -m "docs: update API examples in README"
git commit -m "feat(runner)!: change default error status to 500"
```

## Pull request workflow

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Ensure all checks pass: `bun run biome:ci && bun run check && bun run test && bun run build`
4. Open a PR against `main`
5. CI will run lint, type-check, tests, and build automatically

## Release process

Releases are fully automated. When a PR is merged to `main`, the CI pipeline:

1. Runs lint, type-check, tests, and build
2. Runs `semantic-release`, which:
   - Analyzes commits since the last release to determine the version bump
   - Updates `CHANGELOG.md`
   - Bumps the version in `package.json`
   - Publishes to npm
   - Creates a GitHub release with release notes
   - Commits the changelog and version bump back to `main`

**No manual version bumping or tagging is needed.** Just write meaningful commit messages and the rest is handled automatically.

### What triggers a release?

Only commits with `feat`, `fix`, `perf`, or breaking changes trigger a new release. Commits with `docs`, `chore`, `style`, `refactor`, or `test` do not.
