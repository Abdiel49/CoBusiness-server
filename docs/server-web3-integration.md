# Server ↔ Web3 integration contract

Contract version: `cobusiness-mvp-v1`. API version: `v1`. Status: server interfaces and demo fixtures defined; Testnet producer/consumer verification pending the Web3 repository's approved ABI and deployment artifacts.

## State ownership

Commercial states (`lot.open`, `lot.goal_reached`, `lot.closed`; `order.pending`, `order.confirmed`) describe the server workflow. Escrow states (`unfunded`, `funding`, `funded`, `release_enabled`, `refund_enabled`, `released`, `refunded`) describe confirmed chain facts. A submitted payment is not funded. Only finalized, schema-valid events for the configured network and contract affect escrow projections. Replaying an event with the same canonical identity is a no-op.

The demo lot uses whole blocks: 10 units per block, 20 blocks total, and integer `blockPriceMinor`. Percentage funded is derived from confirmed block count. Terms are frozen at `termsVersion`; the current terms hash is SHA-256 over the canonical JSON snapshot. `goalReachedAt` is set from the confirmed event that first reaches the cap. The operator response window is 24 hours from that timestamp.

## API and errors

- Base path: `/api/v1`; response times are UTC ISO 8601.
- Success envelope: `{ "data": {}, "meta": { "apiVersion": "v1", "timestamp": "..." } }`.
- Error envelope: `{ "error": { "code": "...", "message": "...", "traceId": "..." }, "meta": { ... } }`.
- Contract families: `C-API-01`, `C-ERROR-01`, `C-STATE-01`, `C-AUTH-01`, `C-LOT-01`, `C-ORDER-01`, `C-WALLET-01`, `C-PAY-01`, `C-EVENT-01`, `C-APPROVAL-01`, `C-REFUND-01`, `C-AUDIT-01`.
- Stable negative codes include `TERMS_VERSION_MISMATCH`, `LOT_CAPACITY_EXCEEDED`, `FUNDING_CLOSED`, `WALLET_REQUIRED`, `WALLET_CHALLENGE_INVALID`, `WALLET_NETWORK_MISMATCH`, `PAYMENT_ALREADY_SUBMITTED`, `RELEASE_NOT_ELIGIBLE`, `REFUND_NOT_ELIGIBLE`, and `REFUND_NOT_ENABLED`.

## Future chain payloads

The server prepares unsigned calls only. The user wallet signs and submits. Contract authority remains in the CoBusiness wallet and contract; an API role cannot replace its on-chain authorization.

| Server object | Future chain mapping | Current status |
| --- | --- | --- |
| lot ID | escrow contract instance / stable lot key | Demo ID `lot-demo-001` |
| order ID | buyer contribution record / claim owner | UUID, off-chain until confirmed event mapping |
| terms hash | immutable terms commitment | SHA-256 demo snapshot |
| payment intent | unsigned whole-block contribution call | Prepared only; contract ID unconfigured |
| tx hash | transaction reference | Informational until finalized event |
| confirmed funded event | contribution and lot funded total | Fixture adapter, finality flag required |
| release authorization | CoBusiness-authorized release enablement | Unsigned preparation only |
| refund enablement | CoBusiness-authorized claim enablement | Requires a confirmed `refund_enabled` event |
| individual refund claim | buyer claim of own unreleased contribution | Unsigned preparation only |

Expected event schema is `{ network, contractId, type, lotId, orderId?, amountMinor, txHash, ledger, confirmed }`, with `type` in `funded`, `released`, `refund_enabled`, or `refunded`. Canonical event identity is `network:contractId:txHash:ledger:type`. The indexer must validate event version, contract, network, finality, amounts, and event order; cursor updates and projections must commit atomically. Duplicate events are ignored. Failed transactions and pending events never affect balances. Reconciliation compares indexed totals against contract getters and records discrepancy/lag state.

## Selected demo policy

- The selected refund cause is `funding_deadline_missed`, with immediate eligibility for an explicit simulated operator decline.
- Goal completion alone never pays the operator. A simulated operator continuation and separate CoBusiness authorization are both required to prepare release.
- Release/refund calls remain unsigned. `prepared`, `eligible`, `enabled`, `submitted`, and chain-confirmed `released`/`refunded` are distinct states.
- No CoBusiness commission is charged on refunds. There is no claim against contributions already released.
- A future consolidated execution document must include frozen terms, order IDs, and the confirmed release transaction reference. It must describe a demo record, not legal validity or physical delivery.
- Admin audit is read-only and contains transaction references/discrepancies; it cannot edit balances.

## Future configuration

No real values are committed. A Web3-enabled deployment must provide the Testnet passphrase, RPC URL, token contract/asset ID, escrow contract ID, explorer base URL, ABI version/tag, confirmation/finality policy, and the supported wallet signature verifier. Store credentials and signing authority only in approved secret management; server services must never receive user private keys.

The demo fixture endpoint `POST /api/v1/indexer/events` is disabled unless `INDEXER_FIXTURE_TOKEN` is set. It requires that token in `x-indexer-token`; demo admin sessions do not authorize event ingestion.

## Fixtures

The seeded offer/operator, demo user IDs, `UNCONFIGURED` contract marker, and event schema are synthetic fixtures. They do not evidence Testnet deployment, signature validity, payment, escrow funding, delivery, or refund. Use isolated test fixtures for duplicate events, out-of-order events, unconfirmed events, wrong network/contract, RPC interruption, and balance reconciliation before integrating a real producer.
