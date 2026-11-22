# CoBusiness Server MVP

NestJS 12 demo API for the CoBusiness Stellar MVP. All identities, catalog information, commercial terms, and chain references are fictional. This is not a production identity, wallet-verification, or custody service.

## Architecture and task status

The API delegates to feature modules for identity, catalog, orders, wallet, payments, indexing, approvals, and audit. Shared demo state and PostgreSQL persistence live under `src/core`; module boundaries and remaining MVP dependencies are tracked in [docs/mvp-implementation-status.md](docs/mvp-implementation-status.md).

## Local setup

```sh
cp .env.example .env
docker compose up -d postgres
npm ci
npm run migration:run
npm run start:dev
```

The API listens on `http://localhost:3000`. Swagger UI is at `/api/docs`; the OpenAPI 3 JSON is at `/api/openapi.json`. Liveness and readiness are `/api/v1/health` and `/api/v1/health/ready`. Set a unique password in `.env` for any shared environment. No secrets belong in source control.

Run `npm run build`, `npm run typecheck`, `npm run lint`, `npm test`, and `npm run migration:show` for local checks. `npm run migration:revert` rolls back the most recent migration.

## Demo sessions

`POST /api/v1/auth/demo-session` accepts a fictional user ID: `buyer-demo`, `operator-demo`, `cobusiness-demo`, or `admin-demo`. It returns a bearer token for local demonstrations. These predictable tokens are not authentication. Issuance and use are disabled when `NODE_ENV=production`; Google sign-in and real sessions are not implemented yet. KYC/KYB is explicitly simulated; no documents or real personal data are requested.

Protected routes use the bearer token. Buyers may create whole-block orders and prepare their own payments. Operators can record a simulated commercial response. Only the CoBusiness demo role can prepare release/refund authorization. The API does not sign wallet requests or authorize funds on behalf of a user.

## Financial state rules

Order and lot status are commercial state. Escrow status and amounts come only from confirmed events. Prepared or submitted intents, transaction hashes, and unconfirmed fixtures do not increase funded totals. Amounts are integer minor units represented as decimal strings; asset decimals are explicit in the catalog. Order creation is idempotent by buyer and key. Order terms are pinned to the accepted version and hash.

The demo contract ID is intentionally `UNCONFIGURED`; event fixtures with a different contract or network are rejected. A Stellar signature verifier and a deployed contract adapter are not included, so wallet linking and transaction execution are disabled. The indexer endpoint exists for contract-compatible fixtures and only applies events marked confirmed. Cross-repository Testnet integration remains pending the Web3 contract/deployment artifacts.

The fixture ingestion route is disabled unless `INDEXER_FIXTURE_TOKEN` is set. Keep that token private and use it only from a trusted local fixture runner; demo admin bearer tokens cannot submit events or change projections.

## API contracts

The API base is `/api/v1`, timestamps are ISO 8601 UTC, successful responses use `{ data, meta }`, and errors use `{ error: { code, message, traceId }, meta }`. See [docs/server-web3-integration.md](docs/server-web3-integration.md) for state machines, event identity, mapping, and the future Web3 configuration boundary.

## Database

PostgreSQL is provided by `docker-compose.yml`; configuration is validated on startup. TypeORM schema synchronization is disabled. Migrations create the generic domain record store and chain cursor table. Run migrations before starting the API. Local data is disposable with `docker compose down -v`.
