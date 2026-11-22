# Reservations

Apply migrations with `npm run migration:run`. Migration `AtomicOrders1763680000005` imports existing domain-record orders into the reservation table and preserves their IDs, terms, status and idempotency keys. If legacy orders have duplicate buyer/key pairs or invalid data, the migration fails without silently discarding orders; resolve those records before retrying.

`POST /api/v1/lots/:id/orders` requires a signed-in buyer and accepts `blockCount`, `acceptedTermsVersion` and `idempotencyKey`, with optional `Idempotency-Key` header overriding the body key. Reuse the same key and request data for a retry; different data causes HTTP 409. Database locks prevent concurrent reservations from exceeding capacity across instances. `GET /api/v1/orders/:id` reads the persisted reservation and checks access.

A pending reservation is not a payment. Escrow, payments, reconciliation, release and refunds are deferred to phase 2. The existing demo lot and simulated terms do not represent a real offer.
