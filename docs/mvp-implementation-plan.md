# CoBusiness MVP implementation plan

## Objective and decisions

Integrate the CoBusiness NestJS server and Next.js client with the project's own Soroban escrow contract in `../cobusiness-web3`. This plan targets real Testnet transactions first; it does not integrate Trustless Work or authorize Mainnet use.

Locked decisions:

- Replace fictional user login with Google OIDC, durable users and secure server sessions. Google identity is separate from Stellar wallet ownership and on-chain authorization.
- Keep user and CoBusiness keys in their respective wallets. The server prepares/simulates and observes transactions; the web wallet signs and submits them.
- A new contract version must allow CoBusiness to enable individual refunds after the 24-hour approval window expires following a reached goal. The existing underfunded-at-deadline refund path remains. Release approval expires at the same deadline; a late approval cannot release funds.
- Existing `success` and `refund` deployments are historical verification fixtures. Deploy a new instance for the revised ABI and each new offer.
- Keep all amounts in integer minor units, use ABI/XDR canonical terms, and treat only confirmed contract events as financial evidence.

## Workstreams and task register

### 1. Shared contract and deployment handoff

- Reconcile `deployment.json`, `journal.json`, `release.json` and saved RPC receipts; refresh the Testnet verification independently and publish a consistent attested manifest.
- Freeze the new ABI, event schema, contract/WASM checksums, terms fixture, error mapping, asset and Testnet network configuration across all three repositories.
- Specify and implement the post-goal timeout refund transition, tests and event(s); deploy a new WASM and fresh Testnet escrow instances. Preserve the old instances as read-only history.
- Keep the known limitation explicit: operator confirmation is an off-chain commercial record, while CoBusiness authority signs the on-chain release approval.

### 2. Server identity, wallet and configuration

- Close `MVP-SERVER-001`: publish the shared API/state contract, cancellation and threshold decisions, and exact ABI/event version references.
- Replace `demo-session` in `MVP-SERVER-003` with Google OIDC token validation, durable user/session records, secure cookies, logout, account linking and server-assigned roles. Remove simulated KYC claims from real-user responses unless a real verification provider is added.
- Close `MVP-SERVER-007`: implement the selected Stellar wallet challenge verifier, expiry/replay protection, ownership uniqueness and revoke flow; document/test the chosen browser wallet's Soroban auth support.
- Extend typed Nest configuration for Testnet RPC, passphrase, allowed contract/asset IDs, OAuth client ID/secret, trusted web origins and session settings. Reject production startup if required secrets or Testnet settings are missing/mismatched.

### 3. Soroban transaction adapter and persistent funding lifecycle

- Close `MVP-SERVER-005`: replace seeded commercial values and JSON terms hash with the approved offer data and canonical ScVal/XDR terms hash; keep the offer-to-contract mapping immutable and per offer.
- Close `MVP-SERVER-008`: implement ABI-specific invoke construction and simulation for `contribute(payer, order_ref, block_count, accepted_terms_hash)`. Persist a collision-checked stable `BytesN<32>` `order_ref` mapping for each order. Return the prepared transaction to Web; Web signs/submits and reports its hash.
- Keep the signed transaction lifecycle recoverable: persist intent and hash before submission is reported, never infer funding from `submitted`, `PENDING`, timeout or `NOT_FOUND`, and do not create replacement contributions while the original may still land.
- Make order/idempotency/reservation/intent writes atomic across retries, process crashes and multiple server instances. Keep HTTP controllers thin; isolate chain access behind injected feature providers and repository interfaces.

### 4. Indexing, reconciliation, settlement and refunds

- Close `MVP-SERVER-009`: implement RPC transaction/event reader, durable cursor, stable event identity including event ordinal, atomic event/projection writes, restart recovery and actual sync health.
- Validate transaction `SUCCESS`, contract ID, network, event schema/version, lot/order reference, payer, block count and amount before applying contributions. Read `get_lot`, `get_terms` and `get_contribution`; reconcile contract token balance and accounting totals. Direct token transfers do not count as orders.
- Close `MVP-SERVER-010`: use ledger timestamps/deadlines; prepare `approve_release(operator_confirmed_at, evidence_hash)` and `release()` as distinct wallet-authorized operations; create the execution document only after confirmed `FundsReleased`.
- Close `MVP-SERVER-011`: support both underfunded expiration and post-goal approval timeout; confirm `RefundsEnabled` before buyer claims; require a confirmed, owned, unrefunded contribution for each `claim_refund`.
- Close `MVP-SERVER-012`: compute real lag, failures, balances and discrepancies; expose read-only operational audit with sensitive payload redaction. Disable fixture event ingestion outside test configuration.

### 5. Web integration and complete MVP task set

Audit the current Web implementation against all ten acceptance criteria; there is no checked-in Web task status matrix. Complete only missing behavior:

- `MVP-WEB-001`–`004`: API contract, Google session UX, operator/product and verified offer/terms views.
- `MVP-WEB-005`–`007`: Testnet wallet connect, challenge, transaction review/sign/submit, order receipt, confirmed status, progress and explorer evidence.
- `MVP-WEB-008`–`010`: individual refund journey, operator response/CoBusiness authorization, and operational/audit views backed by actual Server data.

### 6. Cross-repository tasks and integration closure

- Server: `MVP-SERVER-002`, `004` and `006` have local implementation evidence; retain them as locally complete and close remaining review/atomicity acceptance as applicable. Track `001`, `003`, `005`, `007`–`012` to the criteria above.
- Web3: retain locally completed contract/build/test deliverables. Close integration gates for `MVP-WEB3-001`, `004`–`008`; `002` remains the agreed local toolchain/check pipeline, with hosted CI deferred per its acceptance record. Add the revised refund contract version and new Testnet evidence as a tracked extension of the MVP.
- Web: audit all `MVP-WEB-001`–`010`, because no reliable task status file is present.

## Public interface and data changes

- Replace `POST /api/v1/auth/demo-session` with Google sign-in/callback and session logout; retain authenticated `/me` with a real user and server-owned role.
- Keep order/payment routes but change payment preparation to return an ABI-valid simulated Soroban transaction for the configured offer. Submission records the actual hash; confirmation is derived only from RPC evidence.
- Expose separate preparation/status for `approve_release`, `release`, `enable_refunds` and per-order `claim_refund`. Publish new versioned DTOs, errors and event mappings through OpenAPI.
- Persist offer/deployment mapping, user and wallet binding, orders and `order_ref`, idempotency, intents/transaction hashes, event payload/provenance, cursor/checkpoint, reconciled projections and audit events.

## Verification and release gates

- Contract: run Rust/WASM checks for authorization, exact deadline boundaries, new post-goal refund path, underfunded refunds, release/refund exclusivity, duplicate claims and balance conservation.
- Server: unit/integration tests for OIDC claims and session security, wallet proof verification, ScVal encoding/hash fixtures, simulations, transactional idempotency, malformed/duplicate/out-of-order events, RPC interruption, recovery and reconciliation.
- Web: verify login, wallet connect/signing, funding, pending/confirmed distinctions, progress, release and both refund paths with the real API and selected wallet.
- Testnet E2E: use a fresh offer and new contract instance; execute successful multi-buyer funding/release, underfunded expiry refunds, and post-goal approval-timeout refunds. Verify each transaction by RPC, compare event projections with contract getters/balances, and preserve hashes/ledger evidence.
- Do not declare the integrated MVP complete until these three user flows pass through Web, Server and the deployed contract. Mainnet, phase 2, real KYC/KYB, physical-delivery verification and hosted CI for Web3 remain outside this plan.

## Implementation progress

### Task-by-task register (2026-11-21)

Statuses describe local evidence, not integrated acceptance. Server task details and verification are in [mvp-implementation-status.md](mvp-implementation-status.md); Web3's existing local acceptance evidence is in `../cobusiness-web3/docs/mvp/acceptance.md` and `development.md`.

| Task | Local status | Evidence and remaining closure |
| --- | --- | --- |
| MVP-SERVER-001 | Started | API and state draft exist; agree cancellation/threshold rules and align all consumers with escrow-v2. |
| MVP-SERVER-002 | Locally complete | Configuration, database migration, readiness and CI are documented in the server status; remote review remains. |
| MVP-SERVER-003 | Started | Demo identities exist; replace them with verified Google OIDC, durable sessions and server-owned roles. |
| MVP-SERVER-004 | Locally complete | Fictional catalog reads exist; review and integrate with actual offer configuration. |
| MVP-SERVER-005 | Started | Seeded lot exists; bind each offer to verified deployment, asset and canonical XDR terms. |
| MVP-SERVER-006 | Locally complete | Orders and sequential retries exist; atomic multi-instance reservations and idempotency remain. |
| MVP-SERVER-007 | Started | Challenge lifecycle exists; implement cryptographic proof and atomic single-use ownership. |
| MVP-SERVER-008 | Started | Soroban simulation and persisted intent exist; verify deployment association and integrate signing and reported hashes. |
| MVP-SERVER-009 | Started | Fixture projection and checkpoint schema exist; implement confirmed RPC indexer, atomic cursor and reconciliation. |
| MVP-SERVER-010 | Started | Commercial response and fixture-based preparation exist; implement and verify distinct ABI operations. |
| MVP-SERVER-011 | Started | Fixture refund flow exists; require confirmed ownership and implement both on-chain refund paths. |
| MVP-SERVER-012 | Started | Read-only audit skeleton exists; replace placeholder telemetry with actual synchronization and discrepancy data. |
| MVP-WEB3-001 | Started | ABI and event artifacts exist; Server and Web must adopt and verify escrow-v2. |
| MVP-WEB3-002 | Locally complete | Local Rust/WASM pipeline is documented; hosted CI remains deferred by agreement. |
| MVP-WEB3-003 | Locally complete | Constructor, immutable terms and getters are covered by contract tests; consumers must verify deployed terms. |
| MVP-WEB3-004 | Started | Contract tests and Testnet contributions exist; verify actual Server/Web integration. |
| MVP-WEB3-005 | Started | Contract tests and Testnet release exist; verify integrated authorization and execution document. |
| MVP-WEB3-006 | Started | Underfunded refunds confirmed; escrow-v2 timeout implementation is locally tested, but its Testnet claims and Web integration remain. |
| MVP-WEB3-007 | Started | Versioned escrow-v2 artifacts and partial Testnet journal exist; finalize and independently attest the manifest and receipts. |
| MVP-WEB3-008 | Started | Local checks and two Testnet scenarios have evidence; finish the third and all integrated journeys. |
| MVP-WEB-001 | Started | Next.js scaffold and static page exist; integrate and validate the application shell. |
| MVP-WEB-002 | Pending | Implement Google session and role navigation against the real server. |
| MVP-WEB-003 | Pending | Implement authorized operator offer view. |
| MVP-WEB-004 | Pending | Display verified offer and canonical conditions. |
| MVP-WEB-005 | Pending | Implement Testnet wallet connection and proof/signing. |
| MVP-WEB-006 | Pending | Implement checkout, contribution and individual receipt. |
| MVP-WEB-007 | Pending | Display confirmed transaction state, progress and explorer evidence. |
| MVP-WEB-008 | Pending | Implement confirmed individual refund journey. |
| MVP-WEB-009 | Pending | Implement operator response and CoBusiness authorization panels. |
| MVP-WEB-010 | Pending | Implement operational view and validate the walkthrough. |

The saved third Testnet scenario reached its goal at ledger close time 2026-11-21 22:44:51 UTC; its on-chain approval deadline is **2026-11-22 22:44:51 UTC**. On 2026-11-21 the RPC reported ledger 5855617 at 22:55:26 UTC, before the deadline. The journal records both contributions as `SUCCESS` and no timeout enablement or claims. After the ledger reaches the deadline, resume `scripts/testnet_demo.py --release-version v2 --run-id cobusiness-mvp-v2-20261121` with the same journal and verify its runner lock, receipts, events, balances, WASM and manifest. Do not restart with a new journal or repeat contributions. RPC evidence and the final manifest remain pending.

- Implemented the escrow-v2 contract transition that lets CoBusiness enable individual refunds at or after the post-goal approval deadline. Added an exact-deadline Rust test and regenerated versioned ABI/WASM/event/terms artifacts under `cobusiness-web3/artifacts/escrow-v2`; v1 deployment artifacts remain intact.
- Configured the Web3 Testnet runner to select escrow-v2 and its `escrow_v2` event namespace, and added the third acceptance scenario: reach the goal, let the real 24-hour operator-approval window expire, enable refunds, and let each buyer claim individually. The evidence verifier now checks all three scenarios and their transaction/event/TTL evidence. The five local Stellar CLI identities (`cobusiness-authority`, `cobusiness-buyer-a`, `cobusiness-buyer-b`, `cobusiness-deployer`, `cobusiness-operator`) passed the previously run Testnet preflight; their public addresses are recorded by the runner in the deployment manifest.
- Added NestJS Soroban contribution preparation using the Stellar SDK. It simulates `contribute`, returns unsigned XDR and stable transaction hash, and persists a stable per-intent order reference/prepared envelope. Funding preparation returns 503 when contract configuration is absent; it no longer fabricates `UNCONFIGURED` XDR. The configuration is not yet verified against the deployment.
- Funding preparation also rejects a configured terms hash that differs from the order's accepted terms. This is only a mismatch guard: deployment, asset, canonical offer terms and per-offer mapping are not yet verified, so configuring a matching hash alone is not sufficient to safely enable funding.
- Added escrow-v2 canonical ScVal/XDR term serialization and checked its SHA-256 against the contract's Rust-generated fixture. The existing demo offer still uses its legacy JSON hash. Funding preparation remains disabled until an immutable per-offer deployment binding and RPC verification are implemented.
- Audited `co-business-web`: it currently contains a static roadmap/marketing page and project scaffold, with no Google sign-in, API client, wallet connection, offer/order flow, transaction status, refund UX, approval panels or operational view. Of `MVP-WEB-001`–`010`, the scaffold/UI-conventions task is started but incomplete; the other nine are not started. The backlog `GitHub_Tareas_WEB_Stellar_v1.1.md` is an untracked user file and was left untouched.
- Verified so far: Web3 `scripts/check.sh` passed (28 escrow tests, 1 scaffold test, 17 Python tests, WASM build/checksum), the v2 Testnet preflight passed, and the edited Web3 Python scripts compile; Server build, unit tests (6) and lint passed. The regenerated escrow-v2 WASM SHA-256 is `08f9959ef97ea8a8bff3899305b9341aa7f1c43fa05a4fe8883990034d2b3671`.
- Started the authorized Testnet run `cobusiness-mvp-v2-20261121` with the five named local identities. The success scenario is confirmed through release; the underfunded scenario is confirmed through both individual refunds. The third escrow reached its funding goal and is waiting on the contract's real 24-hour approval deadline before its refund transition can be verified. The resumable journal and receipts are local under `cobusiness-web3/.local/testnet/cobusiness-mvp-v2-20261121`; do not commit them because they contain operational evidence and account metadata.
- Still open: finish and independently refresh the 24-hour post-goal timeout evidence; configure the deployed contract and canonical terms in Server; Google OIDC and real sessions; wallet signature verifier and signed-transaction submission; RPC event indexing/reconciliation; Server release/refund orchestration; Web API/wallet integration; complete cross-repository Testnet acceptance. The MVP remains incomplete until those gates pass.
