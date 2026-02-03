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

## Monitoring with Grafana & Tempo

This project includes Grafana and Tempo for distributed tracing and monitoring of errors.

### Docker Compose Setup

```bash
# Start monitoring services
docker compose up -d

# Stop monitoring services
docker compose down

# View logs
docker compose logs -f
```

### Access Points

- **Grafana:** http://localhost:3001 (anonymous access enabled for local dev) - Web UI for visualizing traces
- **Tempo:** http://localhost:3200 - OpenTelemetry trace backend and UI
- **Application:** http://localhost:5173 - Development server
- **OTLP Endpoints:**
  - gRPC: `localhost:4317`
  - HTTP: `localhost:4318`

### Test Scenarios

The app includes comprehensive test scenarios for error handling, logging, and distributed tracing:

**Unexpected Errors (Defects):**
- **Schema Parsing Error:** http://localhost:5173/schema-error
- **Load Function Error:** http://localhost:5173/load-error

**Expected Errors (Control Flow):**
- **404 Not Found:** http://localhost:5173/not-found-error
- **Redirect Example:** http://localhost:5173/redirect-example
- **Form Validation:** http://localhost:5173/form-validation

**Advanced Patterns:**
- **Concurrent Operations:** http://localhost:5173/concurrent-example
- **Log Levels:** http://localhost:5173/log-levels
- **Timeout & Retry:** http://localhost:5173/timeout-retry

**Success Cases:**
- **Load Example:** http://localhost:5173/load-example
- **Home Page:** http://localhost:5173/

Visit http://localhost:5173/errors for an organized index of all test scenarios.

### How It Works

The application uses:
- **OpenTelemetry** to send traces to Tempo via OTLP (gRPC on port 4317, HTTP on port 4318)
- **Effect Runtime** with integrated Logger and OTel layers
- **Grafana** auto-provisioned with Tempo datasource for trace visualization
- **Tempo** configured with:
  - 48-hour trace retention for local development
  - WAL (Write-Ahead Log) for reliable trace ingestion
  - Metrics generator for additional insights
- All operations through `remoteRunner` are automatically traced
- Errors are logged with severity levels (Warning for expected errors, Error for unexpected)
- Services include healthchecks and auto-restart on failure

### Troubleshooting

**Docker services won't start?**
- Check if ports 3001 (Grafana), 3200 (Tempo), 4317 (OTLP gRPC), 4318 (OTLP HTTP) are available
- Ensure Docker is running: `docker ps`
- Check service health: `docker compose ps`

**No traces appearing in Grafana?**
- Verify Tempo is healthy: `docker compose logs tempo`
- Check that the application is sending traces to `http://localhost:4317` or `http://localhost:4318`
- Wait for healthchecks to pass (can take up to 30 seconds for Grafana)
- Verify Tempo datasource in Grafana: Settings → Data Sources → Tempo

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
