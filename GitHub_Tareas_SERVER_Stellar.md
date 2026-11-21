# GitHub Backlog — SERVER — NestJS / Backend

> **Estado:** backlog propuesto para implementación; no acredita funcionalidades existentes ni aprobación de reglas comerciales.
> **Fuentes:** `Documento_Rector_Comercio_Colectivo_v0.4.docx.md`, `Guia_sondeo_importadores.docx.md`, `Proyecto final.md`, `Proyecto_Unificado_Comercio_Colectivo_Stellar_v1.md`, y la especificación Product/Roadmap compartida en la conversación.
> **Convención:** títulos, funcionalidades y campos de issues en inglés técnico; explicaciones de gobierno en español.

## Reglas comunes para GitHub

- **Milestones (exactos):** `MVP`, `Fase 2`, `Fase 3`, `Fase 4` (GitHub milestones son por repositorio).
- **Etiqueta obligatoria de repositorio:** `server` y solo una de `web`, `server`, `web3` por issue técnica.
- **Work Type:** `feature`, `test`, `infrastructure`, `security`, `research`, `documentation` según tarea. **Priority:** campo `P0`–`P3` de GitHub Projects.
- **Features padre:** agrupar tareas por Feature ID; si abarcan repositorios, utilizar issues/enlaces cruzados y no asignar falsa propiedad técnica a la feature padre.
- **Definición de Ready:** dueño/contrato/versiones acordadas, errores y permisos explicitados; tareas consumidoras pueden iniciar con mocks verificados por contrato.
- **Definición de Done:** requisitos y criterios de aceptación verificables, pruebas y revisión PR, documentación actualizada y, cuando aplica, integración entre repositorios comprobada.
- **Dependencias:** `BLOCKING` (no se puede iniciar), `CONTRACT` (iniciar con interfaz aprobada), `INTEGRATION` (implementar con mocks, no cerrar integración), `RUNTIME` (componente necesario al ejecutar).
- **Sistema de registro:** Server almacena órdenes/identidades; Web3 tiene autoridad sobre movimiento de fondos; Web solo presenta/solicita/transmite firmas; no incluir secretos de comprador en Server.
- **Invariantes:** meta lograda ≠ liberación automática; votes/reservas ≠ fondos; `funded = released + refunded + remaining`; activos en unidades enteras exactas; Testnet ≠ USDC real.

## Registro de contratos de integración (índice compartido)

| Contract ID | Dueño de especificación | Versión / entrega | Consumidores |
|---|---|---|---|
| `C-API-01` | `MVP-SERVER-001` | OpenAPI v1 routes, errors, auth, request/response schemas | Web mock client; Server endpoints |
| `C-APPROVAL-01` | `MVP-SERVER-010` | Simulated milestone approval, authorized wallet signing and release preparation | Web approval panel; Server orchestration; Web3 release |
| `C-AUDIT-01` | `MVP-SERVER-012` | Admin read-only audit and sync error summary | Web admin; Server audit |
| `C-AUTH-01` | `MVP-SERVER-003` | Session/RBAC contracts, /me and organization scoping | Web routing; Server authorization |
| `C-CATALOG-01` | `MVP-SERVER-004` | One-product demo SKU, price/asset schema | Web product selection; Server product API |
| `C-DEPLOY-01` | `MVP-WEB3-007` | Testnet passphrase, RPC, token ID, contract ID, explorer and tagged ABI | Web config; Server env; Web3 release |
| `C-ERROR-01` | `MVP-SERVER-001` | Stable error codes, HTTP mapping, trace ID; no sensitive detail | Web error states; Server handlers |
| `C-ESCROW-01` | `MVP-WEB3-001` | Soroban ABI v1: init, contribute, close, approve, release, refund, getters; integer amounts and authorizers | Web wallet; Server adapter; Web3 contract |
| `C-EVENT-01` | `MVP-WEB3-001` | Escrow event topics/data, unique identity, contract/network and version | Server indexer; Web receipts; Web3 emits |
| `C-LOT-01` | `MVP-SERVER-005` | Lot DTO, frozen terms hash, MOQ, token, UTC deadlines and policy snapshot | Web lot pages; Server lot creation; Web3 terms hash |
| `C-OPERATOR-01` | `MVP-SERVER-004` | Demo operator read/write ownership API | Web offer editor; Server operator module |
| `C-ORDER-01` | `MVP-SERVER-006` | Buyer quantity, exact token integer amount and idempotent order intent | Web checkout; Server orders |
| `C-PAY-01` | `MVP-SERVER-008` | Unsigned invocation preparation, payment intent lifecycle and event references | Web signing; Server payments; Web3 contribute |
| `C-REFUND-01` | `MVP-SERVER-011` | Refund eligibility and unsigned claim preparation with chain authority | Web refund UI; Server refunds; Web3 claim |
| `C-STATE-01` | `MVP-SERVER-001` | Separate commercial lot/order statuses from escrow states; confirmed-only totals | Web read models; Server indexer; Web3 events |
| `C-WALLET-01` | `MVP-SERVER-007` | Wallet nonce/challenge/proof binding and Testnet network | Web wallet adapter; Server verification |
| `C-ANALYTICS-02` | `F2-SERVER-007` | Pilot metrics and opt-in feedback source evidence | Web pilot dashboard; Server analytics |
| `C-CATALOG-02` | `F2-SERVER-003` | SKU variants, quotation snapshots and itemized prices | Web variant selection; Server catalog |
| `C-NOTIFY-02` | `F2-SERVER-006` | Notification payload/preference and unique delivery identity | Web notifications; Server outbox |
| `C-OPS-02` | `F2-SERVER-008` | Sync checkpoints, TTL warnings, degraded/recovery indicators | Web status UX; Server operations; Web3 TTL |
| `C-ORDER-02` | `F2-SERVER-003` | Multi-item order, per-line prices and accepted terms | Web checkout; Server orders |
| `C-ORG-02` | `F2-SERVER-001` | Org membership, invitations, role grant and organization access | Web settings; Server ACL |
| `C-PRIVATE-02` | `F2-SERVER-002` | Private lot access/invite expiry and revocation | Web invitation UX; Server ACL |
| `C-REPORT-02` | `F2-SERVER-005` | Buyer/operator scoped dashboards and CSV calculations | Web dashboards; Server aggregation |
| `C-RESERVE-02` | `F2-SERVER-004` | Holds, reservation expiry, availability vs paid order | Web reserve UX; Server reservation concurrency |
| `C-COMPLIANCE-03` | `F3-SERVER-001` | Production gate, jurisdiction/asset policy, provider decision evidence | Web production gating; Server deploy policy; Web3 audit |
| `C-DISPUTE-03` | `F3-SERVER-005` | Dispute claims, private evidence, resolution and permitted allocations | Web dispute workflow; Server arbitration; Web3 hold |
| `C-ESCROW-03` | `F3-WEB3-001` | Escrow ABI v2 and migration policy for milestones, disputes and partial refunds | Web signing; Server operations; Web3 contract |
| `C-EVENT-03` | `F3-WEB3-002` | Event schemas for staged payouts, holds, resolutions and fees | Server ledger; Web status; Web3 emits |
| `C-FINANCE-03` | `F3-SERVER-003` | Asset allowlist, fee snapshot and ledger event classifications | Web fee disclosure; Server ledger; Web3 accounting |
| `C-MILESTONE-03` | `F3-SERVER-004` | Milestone state/evidence/authorized approvers and release preparation | Web reviewers; Server workflow; Web3 stage payout |
| `C-OPS-03` | `F3-SERVER-006` | Reconciliation statuses, fee records and incident signal schemas | Web receipts; Server finance ops |
| `C-VERIFY-03` | `F3-SERVER-002` | KYC/KYB state, private evidence access, verifier decisions | Web onboarding; Server case management |
| `C-ATTRIB-04` | `F4-SERVER-006` | Acquisition attribution, conversions and fee trigger classification | Web analytics; Server fees |
| `C-CONVERT-04` | `F4-SERVER-004` | Selected quotation→new lot and explicit buyer opt-in, no auto-pay | Web opt-in; Server conversion; Web3 unchanged escrow |
| `C-DEMAND-04` | `F4-SERVER-001` | Non-binding buyer request schema and moderation states | Web requests; Server demand |
| `C-INTEREST-04` | `F4-SERVER-002` | Interest/votes and aggregates strictly separate from financial commitments | Web voting; Server counters |
| `C-MARKET-04` | `F4-SERVER-005` | Marketplace search, visibility and provenance of reputation | Web listing; Server index |
| `C-QUOTE-04` | `F4-SERVER-003` | Operator quotes, cost breakdown, versioned selection rules | Web compare; Server proposals |

### Regla de compatibilidad

Los IDs son contratos de diseño propuestos, no endpoints o ABI ya desplegados. Los dueños deben publicar la especificación versionada, ejemplos y fixtures; los consumidores registran hash/tag de la versión y prueban contratos. El Server **no** puede inferir aportes desde un payment intent. Web3 **no** confía en datos de Server para mover fondos sin sus autorizaciones on-chain. Un contrato aprobado habilita trabajo paralelo, pero no significa integración cerrada.

## Matriz de responsabilidades entre repositorios

| Interacción | Produce | Consume | Cierre verificable |
|---|---|---|---|
| Auth / lot / order REST | Server (OpenAPI, fixtures) | Web | Prueba de contrato + E2E con API real |
| ABI, errores, eventos y asset | Web3 (Rust ABI y deployment artifacts) | Server y Web | SDK/adapters contra Testnet y event fixture |
| Payment intent / estado confirmado | Server (validación + indexador) | Web | Orden asociada con tx confirmada sin dobles conteos |
| Signatures / token transfers | Usuario en Web mediante wallet | Soroban | `require_auth` y tx confirmada; Server observa |
| Evidencia comercial y aprobación | Server (reglas y evidencia) + wallet del aprobador | Soroban | Role policy y evento release; evidencia física declarada/simulada |

## Integration Contract Annex — versioned implementation baseline

> **Proposed contract v0.1 — agreement required before implementation.** This annex is repeated verbatim in all three repository backlogs to reduce cross-team ambiguity. It is a proposed engineering design derived from the product description, **not** an API or ABI already implemented. The tasks `MVP-SERVER-001` and `MVP-WEB3-001` must ratify these definitions and publish canonical versioned artifacts. No source repository should silently change field names or financial policies. Use OpenAPI 3.1 as the canonical REST description, Rust source + generated Soroban spec as the authoritative ABI, and tagged event fixtures for indexers.

### A. Representation, identity, consistency

- Public business identifiers: opaque UUID/ULID strings; `lotId`, `orderId`, `operatorId`. On-chain lot identifier mapping (`chainLotId`) MUST be explicit and immutable after initial funding. Store contract ID, network passphrase and asset contract ID per escrow; do not treat address-only keys as globally unique.
- Money values: JSON decimal **strings representing integer smallest asset units**, e.g. `"25000000"`; no JS floating point for any financial operation. `assetDecimals` is a verified configured integer, never a user-editable value. Display conversion is only presentation; no automatic FX conversion inside escrow.
- Dates: ISO-8601 UTC on REST, ledger timestamp / contract-defined close boundary on-chain. Server time is informative; contract checks final deadlines authoritatively. No promise of real-time guarantee from chain indexer.
- `termsHash`: hash of a **canonical, versioned** serialized terms snapshot (price, asset, threshold, expiry, operator, approver, release/refund policies). Specify encoding, byte order, version and algorithm in `C-ESCROW-01`/`C-LOT-01`; never hash ad hoc frontend JSON. Financial terms lock before first deposit.
- Non-binding interest, reserved quantity, off-chain confirmed order and on-chain funded amount are four distinct states and MUST not be merged by any dashboard.
- Authentication: app session for REST, wallet proof for account association and independent Stellar/Soroban authorization for tokens. API role cannot substitute for a required contract signature.

### B. MVP API baseline (`C-API-01` plus domain contracts)

Each line specifies the proposed method, resource and minimal DTO. Server must publish full OpenAPI request/response/errors; Web generates types and mocks from it.

| Method | Route | Auth | Request core | Response core | Primary producer issue |
|---|---|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Public | `{email,password}` or ratified identity provider | session cookie + session metadata | `MVP-SERVER-003` |
| `POST` | `/api/v1/auth/logout` | Session | `{}` | `{success:true}` | `MVP-SERVER-003` |
| `GET` | `/api/v1/me` | Session | — | `{id,email,roles,operatorIds}` | `MVP-SERVER-003` |
| `GET` | `/api/v1/operators/:id` | Public | — | `{id,name,isDemo,verificationLabel}` | `MVP-SERVER-004` |
| `GET` | `/api/v1/products` | Public | `operatorId?` | `{items:[{id,sku,title,unitPriceMinor,assetCode}],nextCursor?}` | `MVP-SERVER-004` |
| `POST` | `/api/v1/lots` | Operator | `{productId,moqUnits,goalAmountMinor,deadlineUtc,assetContractId,termsDraft}` | `{id,status,termsVersion,termsHash}` | `MVP-SERVER-005` |
| `POST` | `/api/v1/lots/:id/publish` | Owner operator | `{expectedTermsVersion}` | `{id,status,termsHash}` | `MVP-SERVER-005` |
| `GET` | `/api/v1/lots` | Public (private filtered later) | `cursor?,status?` | `{items:[LotSummary],nextCursor?}` | `MVP-SERVER-005` |
| `GET` | `/api/v1/lots/:id` | Public | — | `LotDetail` including commercial conditions and financial snapshot references | `MVP-SERVER-005` |
| `POST` | `/api/v1/lots/:id/orders` | Buyer | `{quantityUnits,acceptedTermsVersion,idempotencyKey}` | `{id,amountMinor,assetContractId,status,termsHash}` | `MVP-SERVER-006` |
| `GET` | `/api/v1/orders/:id` | Buyer/owner operator | — | `OrderDetail` scoped to caller | `MVP-SERVER-006` |
| `POST` | `/api/v1/wallets/challenge` | Session | `{walletAddress,network}` | `{challengeId,challengePayload,expiresAt}` | `MVP-SERVER-007` |
| `POST` | `/api/v1/wallets/verify` | Session | `{challengeId,signedProof}` | `{walletId,walletAddress,network,verifiedAt}` | `MVP-SERVER-007` |
| `POST` | `/api/v1/orders/:id/payment-intents` | Buyer | `{walletId,idempotencyKey}` | `{paymentIntentId,contractId,assetContractId,amountMinor,chainLotId,invocationSpec,expiresAt}` | `MVP-SERVER-008` |
| `POST` | `/api/v1/payment-intents/:id/submission` | Buyer | `{txHash}` | `{paymentIntentId,status:'submitted'}`; not funded | `MVP-SERVER-008` |
| `GET` | `/api/v1/payments/:id` | Participant/owner operator | — | `{status,txHash?,confirmedAt?,amountMinor,network}` | `MVP-SERVER-009` |
| `GET` | `/api/v1/lots/:id/escrow` | Public, redacted | — | `{chainStatus,amountFundedMinor,amountReleasedMinor,amountRefundedMinor,amountRemainingMinor,lastIndexedAt}` | `MVP-SERVER-009` |
| `POST` | `/api/v1/lots/:id/demo-release/prepare` | Authorized demo verifier | `{milestoneId,expectedTermsHash}` | `{invocationSpec,policyId}`; caller signs | `MVP-SERVER-010` |
| `GET` | `/api/v1/orders/:id/refund-eligibility` | Buyer | — | `{eligible,maximumMinor,reason,chainLastCheckedAt}` | `MVP-SERVER-011` |
| `POST` | `/api/v1/orders/:id/refunds/prepare` | Buyer | `{walletId}` | `{invocationSpec,maximumMinor}`; buyer signs | `MVP-SERVER-011` |
| `GET` | `/api/v1/admin/audit` | Administrator | `cursor?,lotId?` | `{items:[AuditEntry],nextCursor?}`; **read only** | `MVP-SERVER-012` |

**API error convention (`C-ERROR-01`):** `{code,message,details?,traceId}` with stable machine codes such as `LOT_NOT_OPEN`, `TERMS_VERSION_MISMATCH`, `INSUFFICIENT_QUANTITY`, `WRONG_NETWORK`, `UNAUTHORIZED`, `CONTRACT_NOT_CONFIRMED`, `REFUND_NOT_ELIGIBLE`. HTTP statuses should be documented (400/401/403/404/409/422/429/5xx). Sensitive reasons and PII remain server side. Collection pagination is cursor-based. All writes with retries need idempotency keys or durable unique constraints.

### C. State contracts (`C-STATE-01`)

**Off-chain Lot:** `draft → published → collecting → goal_reached → procurement_pending → completed` with explicit failure branches `expired_underfunded`, `canceled`, `disputed`. These are **proposed**; Server task `MVP-SERVER-001` must settle formal transition table and policy differences for hackathon. F2/F3 extend state machines by versioning rather than silently reusing labels for different meanings.

**Off-chain Order:** `intent_created → awaiting_payment → submitted → funded → refunded_or_completed`, with explicit `expired`, `canceled`, `payment_failed` branches. A pending intent and submitted hash are NOT funded.

**On-chain Escrow (conceptual):** `funding → funded_awaiting_approval → released` or `funding → expired_refundable → refunded`; partial releases/disputes are **Fase 3 only**. Chain status is verified by RPC/contract getter and events, not by operator/admin flag.

**Conservation:** In exact token units for each escrow, `confirmedDeposits = released + refunded + remainingBalance`. Any F3 fee transfer is explicitly represented as a disbursement, not hidden. If MOQ in units and goal in token amount are both specified, the contract cannot infer SKU quantities from payments alone; Server validates quantity/orders and the approved policy must specify how on-chain funding threshold is related to off-chain MOQ. For MVP choose a one-SKU fixed-price lot with `goalAmountMinor = moqUnits × unitPriceMinor` and one-to-one signed amount/order references (subject to on-chain design review).

### D. Soroban ABI and events (`C-ESCROW-01`, `C-EVENT-01`)

**Conceptual external methods, NOT yet an SDK-compatible Rust signature**. Owner `MVP-WEB3-001` must publish exact generated ABI, storage and error enums before adapter implementation.

```text
init_lot(chain_lot_id, token_contract_id, goal_amount_minor, deadline_ledger_time,
         operator_address, approver_address, terms_hash, release_policy_version)
contribute(chain_lot_id, payer_address, order_ref_hash, amount_minor)
close_funding(chain_lot_id)
approve_release(chain_lot_id, milestone_id, approver_address, evidence_hash)
release(chain_lot_id, milestone_id, recipient_address, amount_minor)
claim_refund(chain_lot_id, payer_address)
get_lot(chain_lot_id) -> EscrowSnapshot
get_contribution(chain_lot_id, payer_address) -> ContributionSnapshot
```

**Non-negotiable:** use `require_auth`/supported authorization on every relevant principal; the contract validates accepted token, contribution, preapproved recipient, deadline and amount. It never treats a signed HTTP request as token authorization. Whether multiple orders per payer are supported in MVP must be settled at ABI design time; if not, enforce one funded order per wallet/lot and document that restriction in Server/Web (do not silently support inconsistent multi-order behavior).

**Proposed event fields:** `{eventVersion,network,contractId,chainLotId,eventName,actorAddress,orderRefHash?,amountMinor?,milestoneId?,txHash,ledgerSequence,ledgerClosedAt}`. Event types `LotCreated`, `ContributionConfirmed`, `FundingClosed`, `ReleaseApproved`, `FundsReleased`, `RefundClaimed`. `txHash`/ledger identifiers are indexer transport metadata if not contract-emitted; never pretend the contract knows a transaction hash at execution time. Server idempotency key should use stable `(network,contractId,txHash,eventOrdinal)` or another chain-specified unique event cursor; contract event topic alone is insufficient.

**Funding consistency rule:** one wallet may submit a transaction and Web show `submitted`, but only **final chain confirmation plus indexed matching contract event** may move Server's financial read model to funded. Rechecking contract balance and the event ledger is mandatory on recovery.

### E. Trust boundaries and integration sequencing

1. **First:** `MVP-SERVER-001` and `MVP-WEB3-001` agree on amount unit, `termsHash` algorithm, escrow ABI v1, policy authority and canonical enum/error names. Web generates mocks from approved REST OpenAPI.
2. **Then in parallel:** Web builds listing/order UI on mocks; Server builds order+intent API against a Web3 adapter mock; Web3 builds and tests ABI-compatible contract.
3. **Before integration closure:** `MVP-WEB3-007` supplies Testnet contract ID, asset ID, network passphrase, generated ABI and event fixtures. Server `MVP-SERVER-009` indexes real events with duplicate/retry tests. Web `MVP-WEB-006` signs compatible calls with an actual wallet.
4. **Finally:** run E2E paths: (a) multiple deposits → goal → simulated approval → release; (b) expired underfunded → buyer-signed refund. Verify reconciled amounts, proper signer and explorer references.
5. **F2:** new reservations are off-chain and never create fictitious contributions. **F3:** new ABI + audit + compliance gate are needed for real funds; refunds cannot recapture released money. **F4:** requests and votes never fund anything; conversion creates a fresh lot and independent buyer acceptance.

### F. Configuration inventory (no secrets in client)

| Name | Scope | Meaning |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Web public | REST API URL, no auth tokens |
| `NEXT_PUBLIC_STELLAR_NETWORK` | Web public | Explicit `TESTNET` / production network label |
| `NEXT_PUBLIC_STELLAR_CONTRACT_ID` | Web public | Verified deployed escrow contract for selected network |
| `NEXT_PUBLIC_STELLAR_ASSET_CONTRACT_ID` | Web public | Accepted demo/production token contract ID |
| `DATABASE_URL` | Server secret | PostgreSQL credentials and TLS |
| `STELLAR_RPC_URL` | Server/Web3 deploy configuration | Trusted network RPC endpoint |
| `STELLAR_NETWORK_PASSPHRASE` | Server/Web3 config | Network-specific signing/simulation context |
| `STELLAR_ESCROW_CONTRACT_ID` | Server | Deployed contract allowlist |
| `STELLAR_ASSET_CONTRACT_ID` | Server | Token allowlist |
| `AUTH_SESSION_SECRET` | Server secret | Session signing/encryption |
| `WEB3_DEPLOYER_SECRET` | Restricted deploy environment only | Never available to Web/Server runtime or stored in repo |

These are proposed names; repository owners must publish checked-in `.env.example` without secrets and validate environment/network consistency. Frontend wallet secrets remain under user custody; never upload them to Server.


## Índice de tareas

| ID | Feature | Priority | Estimate | Cross-repository dependencies |
|---|---|---|---:|---|
| `MVP-SERVER-001` | F01 Architecture & contracts | P0 | 5 | — |
| `MVP-SERVER-002` | F01 Architecture & contracts | P0 | 3 | — |
| `MVP-SERVER-003` | F02 Identity & roles | P0 | 5 | — |
| `MVP-SERVER-004` | F03 Operators & catalog | P0 | 3 | — |
| `MVP-SERVER-005` | F04 Collective Orders | P0 | 5 | `MVP-WEB3-001` |
| `MVP-SERVER-006` | F06 Buyer participation | P0 | 5 | — |
| `MVP-SERVER-007` | F07 Wallet & payments | P0 | 5 | — |
| `MVP-SERVER-008` | F07 Wallet & payments | P0 | 5 | `MVP-WEB3-001` |
| `MVP-SERVER-009` | F08 Chain indexing & read models | P0 | 8 | `MVP-WEB3-004`, `MVP-WEB3-005`, `MVP-WEB3-006`, `MVP-WEB3-007` |
| `MVP-SERVER-010` | F09 Close/release/refund demo orchestration | P0 | 5 | `MVP-WEB3-005` |
| `MVP-SERVER-011` | F09 Close/release/refund demo orchestration | P0 | 3 | `MVP-WEB3-006` |
| `MVP-SERVER-012` | F10 Demo verification & observability | P1 | 3 | — |
| `F2-SERVER-001` | F11 Organizations & private operators | P0 | 5 | — |
| `F2-SERVER-002` | F12 Private lots & access | P0 | 5 | — |
| `F2-SERVER-003` | F13 Catalog & order reservations | P0 | 5 | — |
| `F2-SERVER-004` | F13 Catalog & order reservations | P0 | 5 | — |
| `F2-SERVER-005` | F14 Buyer/operator dashboards | P1 | 5 | — |
| `F2-SERVER-006` | F15 Notifications & research instrumentation | P1 | 5 | — |
| `F2-SERVER-007` | F15 Notifications & research instrumentation | P1 | 5 | — |
| `F2-SERVER-008` | F16 Escrow lifecycle reliability | P1 | 5 | `F2-WEB3-001` |
| `F3-SERVER-001` | F17 Compliance & identity | P0 | 5 | — |
| `F3-SERVER-002` | F17 Compliance & identity | P0 | 8 | — |
| `F3-SERVER-003` | F18 Production financial controls | P0 | 5 | — |
| `F3-SERVER-004` | F19 Milestone payments | P0 | 8 | `F3-WEB3-002` |
| `F3-SERVER-005` | F20 Disputes & resolutions | P0 | 8 | `F3-WEB3-003` |
| `F3-SERVER-006` | F21 Financial reconciliation & operations | P0 | 8 | `F3-WEB3-004` |
| `F3-SERVER-007` | F22 Production safeguards | P0 | 5 | — |
| `F4-SERVER-001` | F23 Buyer demand requests | P0 | 5 | — |
| `F4-SERVER-002` | F24 Demand pools & voting | P0 | 5 | — |
| `F4-SERVER-003` | F25 Operator quotations | P0 | 5 | — |
| `F4-SERVER-004` | F26 Convert demand to funded lot | P0 | 8 | — |
| `F4-SERVER-005` | F27 Marketplace discovery & reputations | P1 | 8 | — |
| `F4-SERVER-006` | F28 Marketplace fee attribution & analytics | P1 | 5 | — |

## Milestone: MVP — Prototipo hackathon — Stellar Testnet

Demo con operador y compradores ficticios; dos rutas verificables: meta alcanzada + autorización simulada + payout; meta fallida + reembolso. Sin dinero ni entregas reales.

### Feature: F01 Architecture & contracts

**Resultado esperado:** Common architecture, authoritative schema/ABI and deployment tools.

**Feature acceptance:** Cada tarea hija se prueba; el flujo de usuario y el estado financiero/comercial deben permanecer consistentes después de integrar las tareas dependientes. No se considerará terminada por demos solo con mocks.

#### [MVP-SERVER-001] Define shared product, API, and financial state contracts

**Metadata**

- **Milestone:** MVP
- **Feature:** F01 Architecture & contracts
- **Project Type:** `server`
- **Priority:** `P0`
- **Work Type:** `documentation`
- **Estimate:** `5` story points
- **Assignee:** Unassigned
- **Dependencies:** None

**Description**

Create the canonical versioned integration registry before parallel implementation; settle demo-only policy and API ownership.

**Functional requirements & implementation checklist**

- [ ] FR-01: Document commercial vs escrow state machines.
- [ ] FR-02: define API base path v1, envelope, error codes and dates UTC.
- [ ] FR-03: publish OpenAPI schema with examples.
- [ ] FR-04: version asset decimals and exact integer amounts.
- [ ] FR-05: define contract/event versions and change approval.

**Technical requirements / integration contracts**

- `C-API-01` (owner `MVP-SERVER-001`, phase MVP): OpenAPI v1 routes, errors, auth, request/response schemas.
- `C-STATE-01` (owner `MVP-SERVER-001`, phase MVP): Separate commercial lot/order statuses from escrow states; confirmed-only totals.
- `C-ESCROW-01` (owner `MVP-WEB3-001`, phase MVP): Soroban ABI v1: init, contribute, close, approve, release, refund, getters; integer amounts and authorizers.
- `C-EVENT-01` (owner `MVP-WEB3-001`, phase MVP): Escrow event topics/data, unique identity, contract/network and version.
- `C-ERROR-01` (owner `MVP-SERVER-001`, phase MVP): Stable error codes, HTTP mapping, trace ID; no sensitive detail.

**Dependencies and parallelization**

- None; task can begin once repository and product baseline are available.

**Acceptance criteria**

- [ ] AC-01: All web/server/web3 tasks reference exact contract version.
- [ ] AC-02: no funding state derived from unconfirmed payments.
- [ ] AC-03: decisions on approval roles, thresholds, deadlines and cancellation documented.

**Testing requirements**

OpenAPI lint; schema example validation; cross-team sign-off.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F01 Architecture & contracts; source product master sections 4–11.

#### [MVP-SERVER-002] Bootstrap NestJS, PostgreSQL, migrations and CI

**Metadata**

- **Milestone:** MVP
- **Feature:** F01 Architecture & contracts
- **Project Type:** `server`
- **Priority:** `P0`
- **Work Type:** `infrastructure`
- **Estimate:** `3` story points
- **Assignee:** Unassigned
- **Dependencies:** `MVP-SERVER-001`

**Description**

Create NestJS API modules, database migrations, standard config and CI.

**Functional requirements & implementation checklist**

- [ ] FR-01: Configure NestJS and typed environment.
- [ ] FR-02: wire PostgreSQL migrations and isolated local test database.
- [ ] FR-03: expose health readiness and OpenAPI.
- [ ] FR-04: add CI lint, typecheck, tests and migration validation.

**Technical requirements / integration contracts**

- `C-API-01` (owner `MVP-SERVER-001`, phase MVP): OpenAPI v1 routes, errors, auth, request/response schemas.
- `C-ERROR-01` (owner `MVP-SERVER-001`, phase MVP): Stable error codes, HTTP mapping, trace ID; no sensitive detail.

**Dependencies and parallelization**

- `MVP-SERVER-001` (`server`, BLOCKING / CONTRACT): Define shared product, API, and financial state contracts. Needed deliverable: C-API-01, C-STATE-01. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: Fresh clone starts with documented commands.
- [ ] AC-02: migrations repeat safely.
- [ ] AC-03: CI fails on schema/test errors.

**Testing requirements**

Migration apply/rollback smoke; readiness and env validation.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F01 Architecture & contracts; source product master sections 4–11.
- Related task IDs: MVP-SERVER-001.

### Feature: F02 Identity & roles

**Resultado esperado:** Demo identity and role-based access.

**Feature acceptance:** Cada tarea hija se prueba; el flujo de usuario y el estado financiero/comercial deben permanecer consistentes después de integrar las tareas dependientes. No se considerará terminada por demos solo con mocks.

#### [MVP-SERVER-003] Implement demo authentication, session and RBAC

**Metadata**

- **Milestone:** MVP
- **Feature:** F02 Identity & roles
- **Project Type:** `server`
- **Priority:** `P0`
- **Work Type:** `feature`
- **Estimate:** `5` story points
- **Assignee:** Unassigned
- **Dependencies:** `MVP-SERVER-002`

**Description**

Secure buyer/operator/admin demo identities without processing real KYC.

**Functional requirements & implementation checklist**

- [ ] FR-01: Define users and operator membership schema.
- [ ] FR-02: implement hashed-password or supported identity flow with secure sessions.
- [ ] FR-03: protect writes with role/resource policies.
- [ ] FR-04: expose /auth and /me per OpenAPI.
- [ ] FR-05: log access violations.

**Technical requirements / integration contracts**

- `C-AUTH-01` (owner `MVP-SERVER-003`, phase MVP): Session/RBAC contracts, /me and organization scoping.
- `C-API-01` (owner `MVP-SERVER-001`, phase MVP): OpenAPI v1 routes, errors, auth, request/response schemas.
- `C-ERROR-01` (owner `MVP-SERVER-001`, phase MVP): Stable error codes, HTTP mapping, trace ID; no sensitive detail.

**Dependencies and parallelization**

- `MVP-SERVER-002` (`server`, BLOCKING / CONTRACT): Bootstrap NestJS, PostgreSQL, migrations and CI. Needed deliverable: C-API-01, C-ERROR-01. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: Buyer cannot publish.
- [ ] AC-02: operator cannot mutate another operator lot.
- [ ] AC-03: admin cannot move funds by API role alone.
- [ ] AC-04: token expiry handled.

**Testing requirements**

Auth unit, access matrix, expired session, privilege escalation.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F02 Identity & roles; source product master sections 4–11.
- Related task IDs: MVP-SERVER-002.

### Feature: F03 Operators & catalog

**Resultado esperado:** Fictional operator and demo product.

**Feature acceptance:** Cada tarea hija se prueba; el flujo de usuario y el estado financiero/comercial deben permanecer consistentes después de integrar las tareas dependientes. No se considerará terminada por demos solo con mocks.

#### [MVP-SERVER-004] Create demo operator and product APIs

**Metadata**

- **Milestone:** MVP
- **Feature:** F03 Operators & catalog
- **Project Type:** `server`
- **Priority:** `P0`
- **Work Type:** `feature`
- **Estimate:** `3` story points
- **Assignee:** Unassigned
- **Dependencies:** `MVP-SERVER-003`

**Description**

Provide one explicitly fictional operator and simple SKU metadata for demo lot.

**Functional requirements & implementation checklist**

- [ ] FR-01: Design operator and product tables with ownership.
- [ ] FR-02: seed demo accounts and products.
- [ ] FR-03: expose read and operator-scoped write endpoints.
- [ ] FR-04: validate price decimal/currency and required specs.

**Technical requirements / integration contracts**

- `C-OPERATOR-01` (owner `MVP-SERVER-004`, phase MVP): Demo operator read/write ownership API.
- `C-CATALOG-01` (owner `MVP-SERVER-004`, phase MVP): One-product demo SKU, price/asset schema.
- `C-API-01` (owner `MVP-SERVER-001`, phase MVP): OpenAPI v1 routes, errors, auth, request/response schemas.

**Dependencies and parallelization**

- `MVP-SERVER-003` (`server`, BLOCKING / CONTRACT): Implement demo authentication, session and RBAC. Needed deliverable: C-AUTH-01, C-API-01. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: Demo identities labeled fictional.
- [ ] AC-02: non-owner cannot edit operator product.
- [ ] AC-03: no claim of verified supplier.

**Testing requirements**

CRUD tests; RBAC; validation and fixture stability.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F03 Operators & catalog; source product master sections 4–11.
- Related task IDs: MVP-SERVER-003.

### Feature: F04 Collective Orders

**Resultado esperado:** Publish and discover clearly priced collective lot.

**Feature acceptance:** Cada tarea hija se prueba; el flujo de usuario y el estado financiero/comercial deben permanecer consistentes después de integrar las tareas dependientes. No se considerará terminada por demos solo con mocks.

#### [MVP-SERVER-005] Implement lot schema, policy snapshots and CRUD/publish

**Metadata**

- **Milestone:** MVP
- **Feature:** F04 Collective Orders
- **Project Type:** `server`
- **Priority:** `P0`
- **Work Type:** `feature`
- **Estimate:** `5` story points
- **Assignee:** Unassigned
- **Dependencies:** `MVP-SERVER-001`, `MVP-SERVER-004`, `MVP-WEB3-001`

**Description**

Create authoritative commercial offer records and immutable financing conditions.

**Functional requirements & implementation checklist**

- [ ] FR-01: Add Lot and LotItem models with qty MOQ, token, expiry UTC, financial goal, commercial terms version/hash.
- [ ] FR-02: validate operator ownership.
- [ ] FR-03: expose create/list/detail/publish.
- [ ] FR-04: freeze financial policy after funding starts.
- [ ] FR-05: support published/expired/canceled views.

**Technical requirements / integration contracts**

- `C-LOT-01` (owner `MVP-SERVER-005`, phase MVP): Lot DTO, frozen terms hash, MOQ, token, UTC deadlines and policy snapshot.
- `C-STATE-01` (owner `MVP-SERVER-001`, phase MVP): Separate commercial lot/order statuses from escrow states; confirmed-only totals.
- `C-API-01` (owner `MVP-SERVER-001`, phase MVP): OpenAPI v1 routes, errors, auth, request/response schemas.
- `C-ESCROW-01` (owner `MVP-WEB3-001`, phase MVP): Soroban ABI v1: init, contribute, close, approve, release, refund, getters; integer amounts and authorizers.

**Dependencies and parallelization**

- `MVP-SERVER-001` (`server`, BLOCKING / CONTRACT): Define shared product, API, and financial state contracts. Needed deliverable: C-API-01, C-STATE-01. Follow agreed interface; implementation order can overlap after contract review.
- `MVP-SERVER-004` (`server`, BLOCKING / CONTRACT): Create demo operator and product APIs. Needed deliverable: C-OPERATOR-01, C-CATALOG-01. Follow agreed interface; implementation order can overlap after contract review.
- `MVP-WEB3-001` (`web3`, CONTRACT / INTEGRATION): Specify Soroban escrow ABI and threat model. Needed deliverable: C-ESCROW-01, C-EVENT-01. Start with approved mocks/specifications; integrate and verify before closing.

**Acceptance criteria**

- [ ] AC-01: No publish with invalid MOQ/deadline or token.
- [ ] AC-02: terms_hash deterministic.
- [ ] AC-03: funded lot cannot silently edit terms.
- [ ] AC-04: state changes audited.
- [ ] AC-INT: producer/consumer contract tests pass with the real counterpart; mock-only passing does not complete cross-repository integration.

**Testing requirements**

State transitions, policy immutability, concurrency and CRUD integration.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F04 Collective Orders; source product master sections 4–11.
- Related task IDs: MVP-SERVER-001, MVP-SERVER-004, MVP-WEB3-001.

### Feature: F06 Buyer participation

**Resultado esperado:** Off-chain buyer order before transfer.

**Feature acceptance:** Cada tarea hija se prueba; el flujo de usuario y el estado financiero/comercial deben permanecer consistentes después de integrar las tareas dependientes. No se considerará terminada por demos solo con mocks.

#### [MVP-SERVER-006] Implement order intent and quantity validation

**Metadata**

- **Milestone:** MVP
- **Feature:** F06 Buyer participation
- **Project Type:** `server`
- **Priority:** `P0`
- **Work Type:** `feature`
- **Estimate:** `5` story points
- **Assignee:** Unassigned
- **Dependencies:** `MVP-SERVER-005`, `MVP-SERVER-003`

**Description**

Create off-chain order with accepted conditions and exact value before wallet payment.

**Functional requirements & implementation checklist**

- [ ] FR-01: Create Order/OrderItem schema, status, buyer/lot unique references.
- [ ] FR-02: capture terms version.
- [ ] FR-03: validate max/min and eligibility.
- [ ] FR-04: calculate exact amount in smallest token unit.
- [ ] FR-05: expose POST /lots/:id/orders and GET /orders/:id.

**Technical requirements / integration contracts**

- `C-ORDER-01` (owner `MVP-SERVER-006`, phase MVP): Buyer quantity, exact token integer amount and idempotent order intent.
- `C-LOT-01` (owner `MVP-SERVER-005`, phase MVP): Lot DTO, frozen terms hash, MOQ, token, UTC deadlines and policy snapshot.
- `C-API-01` (owner `MVP-SERVER-001`, phase MVP): OpenAPI v1 routes, errors, auth, request/response schemas.

**Dependencies and parallelization**

- `MVP-SERVER-005` (`server`, BLOCKING / CONTRACT): Implement lot schema, policy snapshots and CRUD/publish. Needed deliverable: C-LOT-01, C-STATE-01. Follow agreed interface; implementation order can overlap after contract review.
- `MVP-SERVER-003` (`server`, BLOCKING / CONTRACT): Implement demo authentication, session and RBAC. Needed deliverable: C-AUTH-01, C-API-01. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: Expired or unpublished lot cannot accept order.
- [ ] AC-02: quantity over available rejected.
- [ ] AC-03: repeated idempotency key does not create duplicate order.

**Testing requirements**

Boundary quantities; duplicate idempotency; concurrency; auth.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F06 Buyer participation; source product master sections 4–11.
- Related task IDs: MVP-SERVER-005, MVP-SERVER-003.

### Feature: F07 Wallet & payments

**Resultado esperado:** User-authorized wallet payment flow.

**Feature acceptance:** Cada tarea hija se prueba; el flujo de usuario y el estado financiero/comercial deben permanecer consistentes después de integrar las tareas dependientes. No se considerará terminada por demos solo con mocks.

#### [MVP-SERVER-007] Implement wallet challenge and verified account binding

**Metadata**

- **Milestone:** MVP
- **Feature:** F07 Wallet & payments
- **Project Type:** `server`
- **Priority:** `P0`
- **Work Type:** `feature`
- **Estimate:** `5` story points
- **Assignee:** Unassigned
- **Dependencies:** `MVP-SERVER-003`, `MVP-SERVER-001`

**Description**

Bind buyer address to app identity through signature and expiry rather than blind input.

**Functional requirements & implementation checklist**

- [ ] FR-01: Create nonce challenge with TTL and network passphrase.
- [ ] FR-02: verify signed proof using supported Stellar signing flow.
- [ ] FR-03: persist address with uniqueness and revoke support.
- [ ] FR-04: expose wallet challenge/verify routes.

**Technical requirements / integration contracts**

- `C-WALLET-01` (owner `MVP-SERVER-007`, phase MVP): Wallet nonce/challenge/proof binding and Testnet network.
- `C-AUTH-01` (owner `MVP-SERVER-003`, phase MVP): Session/RBAC contracts, /me and organization scoping.
- `C-API-01` (owner `MVP-SERVER-001`, phase MVP): OpenAPI v1 routes, errors, auth, request/response schemas.

**Dependencies and parallelization**

- `MVP-SERVER-003` (`server`, BLOCKING / CONTRACT): Implement demo authentication, session and RBAC. Needed deliverable: C-AUTH-01, C-API-01. Follow agreed interface; implementation order can overlap after contract review.
- `MVP-SERVER-001` (`server`, BLOCKING / CONTRACT): Define shared product, API, and financial state contracts. Needed deliverable: C-API-01, C-STATE-01. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: Arbitrary wallet cannot be bound without proof.
- [ ] AC-02: replay/expired nonce rejected.
- [ ] AC-03: testnet address shown with network.

**Testing requirements**

Valid signature, replay, wrong network, wrong owner.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F07 Wallet & payments; source product master sections 4–11.
- Related task IDs: MVP-SERVER-003, MVP-SERVER-001.

#### [MVP-SERVER-008] Implement payment intent/preparation and on-chain tx references

**Metadata**

- **Milestone:** MVP
- **Feature:** F07 Wallet & payments
- **Project Type:** `server`
- **Priority:** `P0`
- **Work Type:** `feature`
- **Estimate:** `5` story points
- **Assignee:** Unassigned
- **Dependencies:** `MVP-SERVER-006`, `MVP-SERVER-007`, `MVP-WEB3-001`

**Description**

Coordinate off-chain order with unsigned wallet-authorized contract invocation.

**Functional requirements & implementation checklist**

- [ ] FR-01: Validate order, buyer wallet, terms hash, asset/amount.
- [ ] FR-02: generate canonical payment intent and serialized invocation or params for approved wallet adapter.
- [ ] FR-03: record intent != confirmed.
- [ ] FR-04: expose intent status and tx-submission reference endpoint.

**Technical requirements / integration contracts**

- `C-PAY-01` (owner `MVP-SERVER-008`, phase MVP): Unsigned invocation preparation, payment intent lifecycle and event references.
- `C-WALLET-01` (owner `MVP-SERVER-007`, phase MVP): Wallet nonce/challenge/proof binding and Testnet network.
- `C-ESCROW-01` (owner `MVP-WEB3-001`, phase MVP): Soroban ABI v1: init, contribute, close, approve, release, refund, getters; integer amounts and authorizers.
- `C-DEPLOY-01` (owner `MVP-WEB3-007`, phase MVP): Testnet passphrase, RPC, token ID, contract ID, explorer and tagged ABI.

**Dependencies and parallelization**

- `MVP-SERVER-006` (`server`, BLOCKING / CONTRACT): Implement order intent and quantity validation. Needed deliverable: C-ORDER-01, C-LOT-01. Follow agreed interface; implementation order can overlap after contract review.
- `MVP-SERVER-007` (`server`, BLOCKING / CONTRACT): Implement wallet challenge and verified account binding. Needed deliverable: C-WALLET-01, C-AUTH-01. Follow agreed interface; implementation order can overlap after contract review.
- `MVP-WEB3-001` (`web3`, CONTRACT / INTEGRATION): Specify Soroban escrow ABI and threat model. Needed deliverable: C-ESCROW-01, C-EVENT-01. Start with approved mocks/specifications; integrate and verify before closing.

**Acceptance criteria**

- [ ] AC-01: Server never signs on behalf of buyers.
- [ ] AC-02: mismatched amount/order/lot rejected.
- [ ] AC-03: unsigned payload matches deployed ABI.
- [ ] AC-04: duplicate submission safe.
- [ ] AC-INT: producer/consumer contract tests pass with the real counterpart; mock-only passing does not complete cross-repository integration.

**Testing requirements**

Intent validation, wrong network, contract adapter mock, idempotency.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F07 Wallet & payments; source product master sections 4–11.
- Related task IDs: MVP-SERVER-006, MVP-SERVER-007, MVP-WEB3-001.

### Feature: F08 Chain indexing & read models

**Resultado esperado:** Confirmed on-chain synchronization.

**Feature acceptance:** Cada tarea hija se prueba; el flujo de usuario y el estado financiero/comercial deben permanecer consistentes después de integrar las tareas dependientes. No se considerará terminada por demos solo con mocks.

#### [MVP-SERVER-009] Index finalized escrow events with idempotent reconciliation

**Metadata**

- **Milestone:** MVP
- **Feature:** F08 Chain indexing & read models
- **Project Type:** `server`
- **Priority:** `P0`
- **Work Type:** `feature`
- **Estimate:** `8` story points
- **Assignee:** Unassigned
- **Dependencies:** `MVP-SERVER-008`, `MVP-WEB3-004`, `MVP-WEB3-005`, `MVP-WEB3-006`, `MVP-WEB3-007`

**Description**

Treat on-chain confirmed events as authority for funded, released and refunded amounts.

**Functional requirements & implementation checklist**

- [ ] FR-01: Build RPC/event reader and checkpoint/cursor.
- [ ] FR-02: validate event schema and contract/network.
- [ ] FR-03: dedupe by canonical event identity.
- [ ] FR-04: update Payment/EscrowLot projection transactionally.
- [ ] FR-05: reconcile contract balances and detect gaps/retries.
- [ ] FR-06: expose GET /lots/:id/escrow and /payments/:id.

**Technical requirements / integration contracts**

- `C-EVENT-01` (owner `MVP-WEB3-001`, phase MVP): Escrow event topics/data, unique identity, contract/network and version.
- `C-ESCROW-01` (owner `MVP-WEB3-001`, phase MVP): Soroban ABI v1: init, contribute, close, approve, release, refund, getters; integer amounts and authorizers.
- `C-PAY-01` (owner `MVP-SERVER-008`, phase MVP): Unsigned invocation preparation, payment intent lifecycle and event references.
- `C-STATE-01` (owner `MVP-SERVER-001`, phase MVP): Separate commercial lot/order statuses from escrow states; confirmed-only totals.

**Dependencies and parallelization**

- `MVP-SERVER-008` (`server`, BLOCKING / CONTRACT): Implement payment intent/preparation and on-chain tx references. Needed deliverable: C-PAY-01, C-WALLET-01. Follow agreed interface; implementation order can overlap after contract review.
- `MVP-WEB3-004` (`web3`, CONTRACT / INTEGRATION): Implement authorized contributions and funding close. Needed deliverable: C-ESCROW-01, C-EVENT-01. Start with approved mocks/specifications; integrate and verify before closing.
- `MVP-WEB3-005` (`web3`, CONTRACT / INTEGRATION): Implement simulated approval and limited release. Needed deliverable: C-ESCROW-01, C-EVENT-01. Start with approved mocks/specifications; integrate and verify before closing.
- `MVP-WEB3-006` (`web3`, CONTRACT / INTEGRATION): Implement expired-underfunded claimable refunds. Needed deliverable: C-ESCROW-01, C-EVENT-01. Start with approved mocks/specifications; integrate and verify before closing.
- `MVP-WEB3-007` (`web3`, CONTRACT / INTEGRATION): Publish Testnet deployment artifacts and executable fixtures. Needed deliverable: C-DEPLOY-01, C-ESCROW-01. Start with approved mocks/specifications; integrate and verify before closing.

**Acceptance criteria**

- [ ] AC-01: Duplicate/out-of-order events cannot double-credit.
- [ ] AC-02: failed tx never funded.
- [ ] AC-03: sums reconcile.
- [ ] AC-04: RPC interruption recovers and health flags lag.
- [ ] AC-INT: producer/consumer contract tests pass with the real counterpart; mock-only passing does not complete cross-repository integration.

**Testing requirements**

Duplicate/out-of-order events, RPC outage, reconciliation integration.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F08 Chain indexing & read models; source product master sections 4–11.
- Related task IDs: MVP-SERVER-008, MVP-WEB3-004, MVP-WEB3-005, MVP-WEB3-006, MVP-WEB3-007.

### Feature: F09 Close/release/refund demo orchestration

**Resultado esperado:** Two end-to-end demonstration paths.

**Feature acceptance:** Cada tarea hija se prueba; el flujo de usuario y el estado financiero/comercial deben permanecer consistentes después de integrar las tareas dependientes. No se considerará terminada por demos solo con mocks.

#### [MVP-SERVER-010] Implement authorized demo close and release preparation APIs

**Metadata**

- **Milestone:** MVP
- **Feature:** F09 Close/release/refund demo orchestration
- **Project Type:** `server`
- **Priority:** `P0`
- **Work Type:** `feature`
- **Estimate:** `5` story points
- **Assignee:** Unassigned
- **Dependencies:** `MVP-SERVER-009`, `MVP-WEB3-005`

**Description**

Coordinate simulated milestone approval without custody of participant funds.

**Functional requirements & implementation checklist**

- [ ] FR-01: Expose authorized demo action to request close and prepare approver-signed release.
- [ ] FR-02: validate chain goal and policy, no blind client trigger.
- [ ] FR-03: persist milestone simulator clearly labeled.
- [ ] FR-04: return unsigned authorized invocation.
- [ ] FR-05: log all decisions.

**Technical requirements / integration contracts**

- `C-APPROVAL-01` (owner `MVP-SERVER-010`, phase MVP): Simulated milestone approval, authorized wallet signing and release preparation.
- `C-ESCROW-01` (owner `MVP-WEB3-001`, phase MVP): Soroban ABI v1: init, contribute, close, approve, release, refund, getters; integer amounts and authorizers.
- `C-EVENT-01` (owner `MVP-WEB3-001`, phase MVP): Escrow event topics/data, unique identity, contract/network and version.

**Dependencies and parallelization**

- `MVP-SERVER-009` (`server`, BLOCKING / CONTRACT): Index finalized escrow events with idempotent reconciliation. Needed deliverable: C-EVENT-01, C-ESCROW-01. Follow agreed interface; implementation order can overlap after contract review.
- `MVP-WEB3-005` (`web3`, CONTRACT / INTEGRATION): Implement simulated approval and limited release. Needed deliverable: C-ESCROW-01, C-EVENT-01. Start with approved mocks/specifications; integrate and verify before closing.

**Acceptance criteria**

- [ ] AC-01: Unauthenticated actor cannot approve.
- [ ] AC-02: reaching goal not sufficient for release.
- [ ] AC-03: no server admin drain.
- [ ] AC-04: released value comes only from chain evidence.
- [ ] AC-INT: producer/consumer contract tests pass with the real counterpart; mock-only passing does not complete cross-repository integration.

**Testing requirements**

Approval RBAC, unauthorized release, happy path integration.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F09 Close/release/refund demo orchestration; source product master sections 4–11.
- Related task IDs: MVP-SERVER-009, MVP-WEB3-005.

#### [MVP-SERVER-011] Implement refundable state and claim preparation API

**Metadata**

- **Milestone:** MVP
- **Feature:** F09 Close/release/refund demo orchestration
- **Project Type:** `server`
- **Priority:** `P0`
- **Work Type:** `feature`
- **Estimate:** `3` story points
- **Assignee:** Unassigned
- **Dependencies:** `MVP-SERVER-009`, `MVP-WEB3-006`

**Description**

Provide read-only refund eligibility and unsigned claim invocation while chain remains final authority.

**Functional requirements & implementation checklist**

- [ ] FR-01: Compute eligibility from contract, not local clock alone.
- [ ] FR-02: expose /orders/:id/refund-eligibility and claim preparation.
- [ ] FR-03: track refund status from events.
- [ ] FR-04: reject unrelated wallet and pending goal.

**Technical requirements / integration contracts**

- `C-REFUND-01` (owner `MVP-SERVER-011`, phase MVP): Refund eligibility and unsigned claim preparation with chain authority.
- `C-ESCROW-01` (owner `MVP-WEB3-001`, phase MVP): Soroban ABI v1: init, contribute, close, approve, release, refund, getters; integer amounts and authorizers.
- `C-EVENT-01` (owner `MVP-WEB3-001`, phase MVP): Escrow event topics/data, unique identity, contract/network and version.

**Dependencies and parallelization**

- `MVP-SERVER-009` (`server`, BLOCKING / CONTRACT): Index finalized escrow events with idempotent reconciliation. Needed deliverable: C-EVENT-01, C-ESCROW-01. Follow agreed interface; implementation order can overlap after contract review.
- `MVP-WEB3-006` (`web3`, CONTRACT / INTEGRATION): Implement expired-underfunded claimable refunds. Needed deliverable: C-ESCROW-01, C-EVENT-01. Start with approved mocks/specifications; integrate and verify before closing.

**Acceptance criteria**

- [ ] AC-01: Refund claim remains possible even if backend unavailable via contract direct call.
- [ ] AC-02: no double counted local refunds.
- [ ] AC-INT: producer/consumer contract tests pass with the real counterpart; mock-only passing does not complete cross-repository integration.

**Testing requirements**

Expired underfunded, wrong buyer, duplicate claim, stale index.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F09 Close/release/refund demo orchestration; source product master sections 4–11.
- Related task IDs: MVP-SERVER-009, MVP-WEB3-006.

### Feature: F10 Demo verification & observability

**Resultado esperado:** Test evidence, admin traceability and reproducible demo.

**Feature acceptance:** Cada tarea hija se prueba; el flujo de usuario y el estado financiero/comercial deben permanecer consistentes después de integrar las tareas dependientes. No se considerará terminada por demos solo con mocks.

#### [MVP-SERVER-012] Implement read-only admin audit and demo telemetry

**Metadata**

- **Milestone:** MVP
- **Feature:** F10 Demo verification & observability
- **Project Type:** `server`
- **Priority:** `P1`
- **Work Type:** `feature`
- **Estimate:** `3` story points
- **Assignee:** Unassigned
- **Dependencies:** `MVP-SERVER-009`, `MVP-SERVER-003`

**Description**

Allow admin to inspect lot state and failures without custody authority.

**Functional requirements & implementation checklist**

- [ ] FR-01: Audit lot/operator/payment actions.
- [ ] FR-02: expose read-only admin summary and sync errors.
- [ ] FR-03: instrument event processing lag.
- [ ] FR-04: annotate fictional demo data.
- [ ] FR-05: restrict logs by role.

**Technical requirements / integration contracts**

- `C-AUDIT-01` (owner `MVP-SERVER-012`, phase MVP): Admin read-only audit and sync error summary.
- `C-STATE-01` (owner `MVP-SERVER-001`, phase MVP): Separate commercial lot/order statuses from escrow states; confirmed-only totals.
- `C-API-01` (owner `MVP-SERVER-001`, phase MVP): OpenAPI v1 routes, errors, auth, request/response schemas.

**Dependencies and parallelization**

- `MVP-SERVER-009` (`server`, BLOCKING / CONTRACT): Index finalized escrow events with idempotent reconciliation. Needed deliverable: C-EVENT-01, C-ESCROW-01. Follow agreed interface; implementation order can overlap after contract review.
- `MVP-SERVER-003` (`server`, BLOCKING / CONTRACT): Implement demo authentication, session and RBAC. Needed deliverable: C-AUTH-01, C-API-01. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: Admin sees transaction refs and discrepancies.
- [ ] AC-02: admin cannot change on-chain balances.
- [ ] AC-03: PII/secrets absent from logs.

**Testing requirements**

Read-only RBAC and log sensitivity checks.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F10 Demo verification & observability; source product master sections 4–11.
- Related task IDs: MVP-SERVER-009, MVP-SERVER-003.

## Milestone: Fase 2 — Piloto privado B2B y validación comercial

Importadores con clientes propios; reservas, lotes privados, reportes, notificaciones y validación de ahorro/tiempo; sin recepción de fondos reales hasta requisitos habilitantes.

### Feature: F11 Organizations & private operators

**Resultado esperado:** Operator teams and organization ownership.

**Feature acceptance:** Cada tarea hija se prueba; el flujo de usuario y el estado financiero/comercial deben permanecer consistentes después de integrar las tareas dependientes. No se considerará terminada por demos solo con mocks.

#### [F2-SERVER-001] Implement organizations, membership and scoped permissions

**Metadata**

- **Milestone:** Fase 2
- **Feature:** F11 Organizations & private operators
- **Project Type:** `server`
- **Priority:** `P0`
- **Work Type:** `feature`
- **Estimate:** `5` story points
- **Assignee:** Unassigned
- **Dependencies:** `MVP-SERVER-003`, `MVP-SERVER-004`

**Description**

Support real operator business identities (unverified at pilot) and team membership.

**Functional requirements & implementation checklist**

- [ ] FR-01: Create organizations/members schema and operator association.
- [ ] FR-02: implement invitation and role ACL.
- [ ] FR-03: add audit and membership revocation.
- [ ] FR-04: expose versioned CRUD.

**Technical requirements / integration contracts**

- `C-ORG-02` (owner `F2-SERVER-001`, phase Fase 2): Org membership, invitations, role grant and organization access.
- `C-AUTH-01` (owner `MVP-SERVER-003`, phase MVP): Session/RBAC contracts, /me and organization scoping.

**Dependencies and parallelization**

- `MVP-SERVER-003` (`server`, BLOCKING / CONTRACT): Implement demo authentication, session and RBAC. Needed deliverable: C-AUTH-01, C-API-01. Follow agreed interface; implementation order can overlap after contract review.
- `MVP-SERVER-004` (`server`, BLOCKING / CONTRACT): Create demo operator and product APIs. Needed deliverable: C-OPERATOR-01, C-CATALOG-01. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: Cross-organization reads/writes denied.
- [ ] AC-02: operator can onboard colleagues.
- [ ] AC-03: identity claims unverified until F3.

**Testing requirements**

Membership ACL, revoked access, uniqueness.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F11 Organizations & private operators; source product master sections 4–11.
- Related task IDs: MVP-SERVER-003, MVP-SERVER-004.

### Feature: F12 Private lots & access

**Resultado esperado:** Invitation-only B2B offers.

**Feature acceptance:** Cada tarea hija se prueba; el flujo de usuario y el estado financiero/comercial deben permanecer consistentes después de integrar las tareas dependientes. No se considerará terminada por demos solo con mocks.

#### [F2-SERVER-002] Implement invitation-only lot visibility and link lifecycle

**Metadata**

- **Milestone:** Fase 2
- **Feature:** F12 Private lots & access
- **Project Type:** `server`
- **Priority:** `P0`
- **Work Type:** `feature`
- **Estimate:** `5` story points
- **Assignee:** Unassigned
- **Dependencies:** `MVP-SERVER-005`, `F2-SERVER-001`

**Description**

Support operator-owned closed buyer cohorts without a public marketplace.

**Functional requirements & implementation checklist**

- [ ] FR-01: Add privacy/access policy on lots.
- [ ] FR-02: generate scoped expiring invite codes.
- [ ] FR-03: validate buyer invitations and permissions.
- [ ] FR-04: audit accept/revoke.
- [ ] FR-05: prevent invite leaks via list/search.

**Technical requirements / integration contracts**

- `C-PRIVATE-02` (owner `F2-SERVER-002`, phase Fase 2): Private lot access/invite expiry and revocation.
- `C-LOT-01` (owner `MVP-SERVER-005`, phase MVP): Lot DTO, frozen terms hash, MOQ, token, UTC deadlines and policy snapshot.

**Dependencies and parallelization**

- `MVP-SERVER-005` (`server`, BLOCKING / CONTRACT): Implement lot schema, policy snapshots and CRUD/publish. Needed deliverable: C-LOT-01, C-STATE-01. Follow agreed interface; implementation order can overlap after contract review.
- `F2-SERVER-001` (`server`, BLOCKING / CONTRACT): Implement organizations, membership and scoped permissions. Needed deliverable: C-ORG-02, C-AUTH-01. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: Unauthorized buyer cannot view or join private lot.
- [ ] AC-02: revoked invite invalid.
- [ ] AC-03: existing paid obligations unaffected.

**Testing requirements**

Enumeration, expiry, revocation, private listing ACL.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F12 Private lots & access; source product master sections 4–11.
- Related task IDs: MVP-SERVER-005, F2-SERVER-001.

### Feature: F13 Catalog & order reservations

**Resultado esperado:** Multi-item selection and non-binding reservations.

**Feature acceptance:** Cada tarea hija se prueba; el flujo de usuario y el estado financiero/comercial deben permanecer consistentes después de integrar las tareas dependientes. No se considerará terminada por demos solo con mocks.

#### [F2-SERVER-003] Implement product variants and versioned price quotations

**Metadata**

- **Milestone:** Fase 2
- **Feature:** F13 Catalog & order reservations
- **Project Type:** `server`
- **Priority:** `P0`
- **Work Type:** `feature`
- **Estimate:** `5` story points
- **Assignee:** Unassigned
- **Dependencies:** `MVP-SERVER-006`, `MVP-SERVER-004`

**Description**

Expand catalog while preserving immutable order-level pricing.

**Functional requirements & implementation checklist**

- [ ] FR-01: Introduce variants/SKU, product options and quoted unit prices.
- [ ] FR-02: snapshot unit pricing in order.
- [ ] FR-03: calculate exact amounts and update terms hash when drafting.
- [ ] FR-04: handle unavailable combinations.

**Technical requirements / integration contracts**

- `C-CATALOG-02` (owner `F2-SERVER-003`, phase Fase 2): SKU variants, quotation snapshots and itemized prices.
- `C-ORDER-02` (owner `F2-SERVER-003`, phase Fase 2): Multi-item order, per-line prices and accepted terms.
- `C-LOT-01` (owner `MVP-SERVER-005`, phase MVP): Lot DTO, frozen terms hash, MOQ, token, UTC deadlines and policy snapshot.

**Dependencies and parallelization**

- `MVP-SERVER-006` (`server`, BLOCKING / CONTRACT): Implement order intent and quantity validation. Needed deliverable: C-ORDER-01, C-LOT-01. Follow agreed interface; implementation order can overlap after contract review.
- `MVP-SERVER-004` (`server`, BLOCKING / CONTRACT): Create demo operator and product APIs. Needed deliverable: C-OPERATOR-01, C-CATALOG-01. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: Mixed variant order totals correct.
- [ ] AC-02: funded terms unchanged.
- [ ] AC-03: invalid variant rejected.

**Testing requirements**

Price snapshots, multi-items, decimals, invalid SKU.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F13 Catalog & order reservations; source product master sections 4–11.
- Related task IDs: MVP-SERVER-006, MVP-SERVER-004.

#### [F2-SERVER-004] Implement reservations, capacity locking and expiration

**Metadata**

- **Milestone:** Fase 2
- **Feature:** F13 Catalog & order reservations
- **Project Type:** `server`
- **Priority:** `P0`
- **Work Type:** `feature`
- **Estimate:** `5` story points
- **Assignee:** Unassigned
- **Dependencies:** `F2-SERVER-003`, `MVP-SERVER-009`

**Description**

Separate non-binding reservation from confirmed paid commitment to avoid phantom funding.

**Functional requirements & implementation checklist**

- [ ] FR-01: Create Reservation model, quotas and expiration.
- [ ] FR-02: implement concurrency-safe hold/release and status transitions.
- [ ] FR-03: expose reserve/confirm/cancel endpoints.
- [ ] FR-04: never increment chain funded by reservation.

**Technical requirements / integration contracts**

- `C-RESERVE-02` (owner `F2-SERVER-004`, phase Fase 2): Holds, reservation expiry, availability vs paid order.
- `C-STATE-01` (owner `MVP-SERVER-001`, phase MVP): Separate commercial lot/order statuses from escrow states; confirmed-only totals.
- `C-ORDER-02` (owner `F2-SERVER-003`, phase Fase 2): Multi-item order, per-line prices and accepted terms.

**Dependencies and parallelization**

- `F2-SERVER-003` (`server`, BLOCKING / CONTRACT): Implement product variants and versioned price quotations. Needed deliverable: C-CATALOG-02, C-ORDER-02. Follow agreed interface; implementation order can overlap after contract review.
- `MVP-SERVER-009` (`server`, BLOCKING / CONTRACT): Index finalized escrow events with idempotent reconciliation. Needed deliverable: C-EVENT-01, C-ESCROW-01. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: Capacity cannot oversell under parallel requests.
- [ ] AC-02: expired reserve releases quantity.
- [ ] AC-03: reservations never counted as escrow funds.

**Testing requirements**

Concurrent reservations and TTL expiry integration.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F13 Catalog & order reservations; source product master sections 4–11.
- Related task IDs: F2-SERVER-003, MVP-SERVER-009.

### Feature: F14 Buyer/operator dashboards

**Resultado esperado:** Operational reporting for both sides.

**Feature acceptance:** Cada tarea hija se prueba; el flujo de usuario y el estado financiero/comercial deben permanecer consistentes después de integrar las tareas dependientes. No se considerará terminada por demos solo con mocks.

#### [F2-SERVER-005] Implement order reports and organization-scoped aggregation

**Metadata**

- **Milestone:** Fase 2
- **Feature:** F14 Buyer/operator dashboards
- **Project Type:** `server`
- **Priority:** `P1`
- **Work Type:** `feature`
- **Estimate:** `5` story points
- **Assignee:** Unassigned
- **Dependencies:** `F2-SERVER-004`, `MVP-SERVER-009`

**Description**

Provide operational metrics for importer and buyer without mixing estimates and chain funds.

**Functional requirements & implementation checklist**

- [ ] FR-01: Add buyer orders and operator order/report endpoints.
- [ ] FR-02: group reserved, confirmed, funded and refunded separately.
- [ ] FR-03: export CSV with explicit units and timezone.
- [ ] FR-04: optimize queries and auth checks.

**Technical requirements / integration contracts**

- `C-REPORT-02` (owner `F2-SERVER-005`, phase Fase 2): Buyer/operator scoped dashboards and CSV calculations.
- `C-STATE-01` (owner `MVP-SERVER-001`, phase MVP): Separate commercial lot/order statuses from escrow states; confirmed-only totals.

**Dependencies and parallelization**

- `F2-SERVER-004` (`server`, BLOCKING / CONTRACT): Implement reservations, capacity locking and expiration. Needed deliverable: C-RESERVE-02, C-STATE-01. Follow agreed interface; implementation order can overlap after contract review.
- `MVP-SERVER-009` (`server`, BLOCKING / CONTRACT): Index finalized escrow events with idempotent reconciliation. Needed deliverable: C-EVENT-01, C-ESCROW-01. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: Operator cannot see other org buyers.
- [ ] AC-02: totals reconcile with chain projections.
- [ ] AC-03: refunds not shown as sales.

**Testing requirements**

Aggregation fixtures, authorization, pagination.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F14 Buyer/operator dashboards; source product master sections 4–11.
- Related task IDs: F2-SERVER-004, MVP-SERVER-009.

### Feature: F15 Notifications & research instrumentation

**Resultado esperado:** Notifications, commercial measurement and feedback.

**Feature acceptance:** Cada tarea hija se prueba; el flujo de usuario y el estado financiero/comercial deben permanecer consistentes después de integrar las tareas dependientes. No se considerará terminada por demos solo con mocks.

#### [F2-SERVER-006] Implement notifications with idempotent transactional outbox

**Metadata**

- **Milestone:** Fase 2
- **Feature:** F15 Notifications & research instrumentation
- **Project Type:** `server`
- **Priority:** `P1`
- **Work Type:** `feature`
- **Estimate:** `5` story points
- **Assignee:** Unassigned
- **Dependencies:** `F2-SERVER-004`, `MVP-SERVER-009`

**Description**

Notify users of funding/expiration and reservation changes without duplicate sends.

**Functional requirements & implementation checklist**

- [ ] FR-01: Define templates and preference model.
- [ ] FR-02: create outbox on state transitions.
- [ ] FR-03: background worker retries idempotently.
- [ ] FR-04: do not send on unconfirmed chain event.
- [ ] FR-05: expose notification list.

**Technical requirements / integration contracts**

- `C-NOTIFY-02` (owner `F2-SERVER-006`, phase Fase 2): Notification payload/preference and unique delivery identity.
- `C-EVENT-01` (owner `MVP-WEB3-001`, phase MVP): Escrow event topics/data, unique identity, contract/network and version.

**Dependencies and parallelization**

- `F2-SERVER-004` (`server`, BLOCKING / CONTRACT): Implement reservations, capacity locking and expiration. Needed deliverable: C-RESERVE-02, C-STATE-01. Follow agreed interface; implementation order can overlap after contract review.
- `MVP-SERVER-009` (`server`, BLOCKING / CONTRACT): Index finalized escrow events with idempotent reconciliation. Needed deliverable: C-EVENT-01, C-ESCROW-01. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: One notification per event/user despite retries.
- [ ] AC-02: opt-out applied except mandatory service messages.
- [ ] AC-03: failures monitored.

**Testing requirements**

Outbox retries, dedupe, delivery failure.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F15 Notifications & research instrumentation; source product master sections 4–11.
- Related task IDs: F2-SERVER-004, MVP-SERVER-009.

#### [F2-SERVER-007] Implement commercial pilot metrics and non-financial research records

**Metadata**

- **Milestone:** Fase 2
- **Feature:** F15 Notifications & research instrumentation
- **Project Type:** `server`
- **Priority:** `P1`
- **Work Type:** `feature`
- **Estimate:** `5` story points
- **Assignee:** Unassigned
- **Dependencies:** `F2-SERVER-005`

**Description**

Measure whether importer workflow saves effort without inventing revenue.

**Functional requirements & implementation checklist**

- [ ] FR-01: Capture operator-defined baseline, invitation/conversion metrics, completion time and order mix.
- [ ] FR-02: segment non-binding vs paid.
- [ ] FR-03: store interview reference only with consent.
- [ ] FR-04: create aggregate API.

**Technical requirements / integration contracts**

- `C-ANALYTICS-02` (owner `F2-SERVER-007`, phase Fase 2): Pilot metrics and opt-in feedback source evidence.
- `C-REPORT-02` (owner `F2-SERVER-005`, phase Fase 2): Buyer/operator scoped dashboards and CSV calculations.

**Dependencies and parallelization**

- `F2-SERVER-005` (`server`, BLOCKING / CONTRACT): Implement order reports and organization-scoped aggregation. Needed deliverable: C-REPORT-02, C-STATE-01. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: Dashboards exclude demo from real KPI.
- [ ] AC-02: all metrics dated/sourced.
- [ ] AC-03: access restricted.

**Testing requirements**

Metric aggregation, data masking, consent and demo filtering.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F15 Notifications & research instrumentation; source product master sections 4–11.
- Related task IDs: F2-SERVER-005.

### Feature: F16 Escrow lifecycle reliability

**Resultado esperado:** Reconciliation and storage lifecycle resilience.

**Feature acceptance:** Cada tarea hija se prueba; el flujo de usuario y el estado financiero/comercial deben permanecer consistentes después de integrar las tareas dependientes. No se considerará terminada por demos solo con mocks.

#### [F2-SERVER-008] Implement chain event backfill, TTL monitoring and incident response

**Metadata**

- **Milestone:** Fase 2
- **Feature:** F16 Escrow lifecycle reliability
- **Project Type:** `server`
- **Priority:** `P1`
- **Work Type:** `infrastructure`
- **Estimate:** `5` story points
- **Assignee:** Unassigned
- **Dependencies:** `MVP-SERVER-009`, `F2-WEB3-001`

**Description**

Operate chain synchronization reliably for multi-operator pilots.

**Functional requirements & implementation checklist**

- [ ] FR-01: Set index checkpoints and backfills, metrics alerts for stalled events and storage TTL.
- [ ] FR-02: reconcile snapshots and events.
- [ ] FR-03: expose operations dashboard data.
- [ ] FR-04: document recovery with no loss of accounting.

**Technical requirements / integration contracts**

- `C-EVENT-01` (owner `MVP-WEB3-001`, phase MVP): Escrow event topics/data, unique identity, contract/network and version.
- `C-DEPLOY-01` (owner `MVP-WEB3-007`, phase MVP): Testnet passphrase, RPC, token ID, contract ID, explorer and tagged ABI.
- `C-OPS-02` (owner `F2-SERVER-008`, phase Fase 2): Sync checkpoints, TTL warnings, degraded/recovery indicators.

**Dependencies and parallelization**

- `MVP-SERVER-009` (`server`, BLOCKING / CONTRACT): Index finalized escrow events with idempotent reconciliation. Needed deliverable: C-EVENT-01, C-ESCROW-01. Follow agreed interface; implementation order can overlap after contract review.
- `F2-WEB3-001` (`web3`, CONTRACT / INTEGRATION): Implement on-chain retention/TTL maintenance runbook. Needed deliverable: C-ESCROW-01, C-DEPLOY-01. Start with approved mocks/specifications; integrate and verify before closing.

**Acceptance criteria**

- [ ] AC-01: Backfill does not duplicate credits.
- [ ] AC-02: alert on RPC lag and TTL danger.
- [ ] AC-03: recovery independently testable.
- [ ] AC-INT: producer/consumer contract tests pass with the real counterpart; mock-only passing does not complete cross-repository integration.

**Testing requirements**

Backfill, RPC restart, TTL alert and reconciliation.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F16 Escrow lifecycle reliability; source product master sections 4–11.
- Related task IDs: MVP-SERVER-009, F2-WEB3-001.

## Milestone: Fase 3 — Protecciones financieras y preparación operativa

KYC/KYB, legal gate, activos y comisiones, hitos, disputas, conciliación y auditoría. Mainnet únicamente tras autorización legal/operativa y revisión de seguridad.

### Feature: F17 Compliance & identity

**Resultado esperado:** Legal gates and private identity verification.

**Feature acceptance:** Cada tarea hija se prueba; el flujo de usuario y el estado financiero/comercial deben permanecer consistentes después de integrar las tareas dependientes. No se considerará terminada por demos solo con mocks.

#### [F3-SERVER-001] Document regulated-money prerequisites and deployment gates

**Metadata**

- **Milestone:** Fase 3
- **Feature:** F17 Compliance & identity
- **Project Type:** `server`
- **Priority:** `P0`
- **Work Type:** `research`
- **Estimate:** `5` story points
- **Assignee:** Unassigned
- **Dependencies:** `F2-SERVER-007`

**Description**

Prevent real fund operations before counsel/security/provider approval.

**Functional requirements & implementation checklist**

- [ ] FR-01: Define operator of record, funds control, supported jurisdictions and assets.
- [ ] FR-02: identify KYC/AML, privacy, tax and license review owners.
- [ ] FR-03: enforce production enablement gate with evidence checklist.
- [ ] FR-04: no assumption that smart contract removes compliance.

**Technical requirements / integration contracts**

- `C-COMPLIANCE-03` (owner `F3-SERVER-001`, phase Fase 3): Production gate, jurisdiction/asset policy, provider decision evidence.

**Dependencies and parallelization**

- `F2-SERVER-007` (`server`, BLOCKING / CONTRACT): Implement commercial pilot metrics and non-financial research records. Needed deliverable: C-ANALYTICS-02, C-REPORT-02. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: Production payment flag cannot enable without approval artifacts.
- [ ] AC-02: known unresolved issues remain explicit.

**Testing requirements**

Release gate checklist and denied production deployment.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F17 Compliance & identity; source product master sections 4–11.
- Related task IDs: F2-SERVER-007.

#### [F3-SERVER-002] Implement KYC/KYB cases and protected document lifecycle

**Metadata**

- **Milestone:** Fase 3
- **Feature:** F17 Compliance & identity
- **Project Type:** `server`
- **Priority:** `P0`
- **Work Type:** `feature`
- **Estimate:** `8` story points
- **Assignee:** Unassigned
- **Dependencies:** `F3-SERVER-001`, `F2-SERVER-001`

**Description**

Integrate provider or reviewer workflow without publishing PII on-chain.

**Functional requirements & implementation checklist**

- [ ] FR-01: Model cases, subject, reviewer, expiration and appeal.
- [ ] FR-02: encrypted private evidence storage and scoped access.
- [ ] FR-03: provider webhook signed/idempotent.
- [ ] FR-04: retention/deletion policy.
- [ ] FR-05: verified/declared public distinctions.

**Technical requirements / integration contracts**

- `C-VERIFY-03` (owner `F3-SERVER-002`, phase Fase 3): KYC/KYB state, private evidence access, verifier decisions.
- `C-COMPLIANCE-03` (owner `F3-SERVER-001`, phase Fase 3): Production gate, jurisdiction/asset policy, provider decision evidence.

**Dependencies and parallelization**

- `F3-SERVER-001` (`server`, BLOCKING / CONTRACT): Document regulated-money prerequisites and deployment gates. Needed deliverable: C-COMPLIANCE-03. Follow agreed interface; implementation order can overlap after contract review.
- `F2-SERVER-001` (`server`, BLOCKING / CONTRACT): Implement organizations, membership and scoped permissions. Needed deliverable: C-ORG-02, C-AUTH-01. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: Non-reviewer cannot access docs.
- [ ] AC-02: expired verification blocks gated actions per policy.
- [ ] AC-03: no PII on chain/logs.

**Testing requirements**

RBAC, signed webhook, retention and rejection.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F17 Compliance & identity; source product master sections 4–11.
- Related task IDs: F3-SERVER-001, F2-SERVER-001.

### Feature: F18 Production financial controls

**Resultado esperado:** Asset/fee policies and production security design.

**Feature acceptance:** Cada tarea hija se prueba; el flujo de usuario y el estado financiero/comercial deben permanecer consistentes después de integrar las tareas dependientes. No se considerará terminada por demos solo con mocks.

#### [F3-SERVER-003] Implement production asset and fee policy registry

**Metadata**

- **Milestone:** Fase 3
- **Feature:** F18 Production financial controls
- **Project Type:** `server`
- **Priority:** `P0`
- **Work Type:** `feature`
- **Estimate:** `5` story points
- **Assignee:** Unassigned
- **Dependencies:** `F3-SERVER-001`, `MVP-SERVER-005`

**Description**

Validate supported assets, units, FX assumptions and fee schedules.

**Functional requirements & implementation checklist**

- [ ] FR-01: Define allowlist network/token and minimum balance.
- [ ] FR-02: store immutable per-lot fee policy and terms hash.
- [ ] FR-03: reject wrong asset/decimal or stale policy.
- [ ] FR-04: keep testnet vs mainnet configs separated.

**Technical requirements / integration contracts**

- `C-FINANCE-03` (owner `F3-SERVER-003`, phase Fase 3): Asset allowlist, fee snapshot and ledger event classifications.
- `C-COMPLIANCE-03` (owner `F3-SERVER-001`, phase Fase 3): Production gate, jurisdiction/asset policy, provider decision evidence.
- `C-ESCROW-03` (owner `F3-WEB3-001`, phase Fase 3): Escrow ABI v2 and migration policy for milestones, disputes and partial refunds.

**Dependencies and parallelization**

- `F3-SERVER-001` (`server`, BLOCKING / CONTRACT): Document regulated-money prerequisites and deployment gates. Needed deliverable: C-COMPLIANCE-03. Follow agreed interface; implementation order can overlap after contract review.
- `MVP-SERVER-005` (`server`, BLOCKING / CONTRACT): Implement lot schema, policy snapshots and CRUD/publish. Needed deliverable: C-LOT-01, C-STATE-01. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: Fees visible before commitment.
- [ ] AC-02: no float accounting.
- [ ] AC-03: unauthorized asset rejected.
- [ ] AC-04: prod disabled until gate.

**Testing requirements**

Fee calculation and asset authorization.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F18 Production financial controls; source product master sections 4–11.
- Related task IDs: F3-SERVER-001, MVP-SERVER-005.

### Feature: F19 Milestone payments

**Resultado esperado:** Evidence-backed approvals and staged disbursement.

**Feature acceptance:** Cada tarea hija se prueba; el flujo de usuario y el estado financiero/comercial deben permanecer consistentes después de integrar las tareas dependientes. No se considerará terminada por demos solo con mocks.

#### [F3-SERVER-004] Implement milestone/evidence and approver authority APIs

**Metadata**

- **Milestone:** Fase 3
- **Feature:** F19 Milestone payments
- **Project Type:** `server`
- **Priority:** `P0`
- **Work Type:** `feature`
- **Estimate:** `8` story points
- **Assignee:** Unassigned
- **Dependencies:** `F3-SERVER-002`, `F3-WEB3-002`, `F3-SERVER-003`

**Description**

Manage off-chain evidence, approval intents, and release authorization without server signing user approvals.

**Functional requirements & implementation checklist**

- [ ] FR-01: Model milestone, evidence digest/private storage, approver assignments and terms.
- [ ] FR-02: verify signer roles with contract.
- [ ] FR-03: expose create/evidence/review/approve prepare endpoints.
- [ ] FR-04: track signed tx and chain events.

**Technical requirements / integration contracts**

- `C-MILESTONE-03` (owner `F3-SERVER-004`, phase Fase 3): Milestone state/evidence/authorized approvers and release preparation.
- `C-ESCROW-03` (owner `F3-WEB3-001`, phase Fase 3): Escrow ABI v2 and migration policy for milestones, disputes and partial refunds.
- `C-EVENT-03` (owner `F3-WEB3-002`, phase Fase 3): Event schemas for staged payouts, holds, resolutions and fees.

**Dependencies and parallelization**

- `F3-SERVER-002` (`server`, BLOCKING / CONTRACT): Implement KYC/KYB cases and protected document lifecycle. Needed deliverable: C-VERIFY-03, C-COMPLIANCE-03. Follow agreed interface; implementation order can overlap after contract review.
- `F3-WEB3-002` (`web3`, CONTRACT / INTEGRATION): Implement milestone escrow, partial releases and timeout. Needed deliverable: C-ESCROW-03, C-MILESTONE-03. Start with approved mocks/specifications; integrate and verify before closing.
- `F3-SERVER-003` (`server`, BLOCKING / CONTRACT): Implement production asset and fee policy registry. Needed deliverable: C-FINANCE-03, C-COMPLIANCE-03. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: Unapproved milestone cannot be paid.
- [ ] AC-02: evidence is labeled declared/verified.
- [ ] AC-03: approver segregation enforced.
- [ ] AC-04: no secret keys retained.
- [ ] AC-INT: producer/consumer contract tests pass with the real counterpart; mock-only passing does not complete cross-repository integration.

**Testing requirements**

Role matrix, tampered evidence and release sync.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F19 Milestone payments; source product master sections 4–11.
- Related task IDs: F3-SERVER-002, F3-WEB3-002, F3-SERVER-003.

### Feature: F20 Disputes & resolutions

**Resultado esperado:** Dispute procedures and residual-fund resolution.

**Feature acceptance:** Cada tarea hija se prueba; el flujo de usuario y el estado financiero/comercial deben permanecer consistentes después de integrar las tareas dependientes. No se considerará terminada por demos solo con mocks.

#### [F3-SERVER-005] Implement dispute cases, evidence and resolution preparation

**Metadata**

- **Milestone:** Fase 3
- **Feature:** F20 Disputes & resolutions
- **Project Type:** `server`
- **Priority:** `P0`
- **Work Type:** `feature`
- **Estimate:** `8` story points
- **Assignee:** Unassigned
- **Dependencies:** `F3-SERVER-004`, `F3-WEB3-003`

**Description**

Track legally defined dispute lifecycle, deadlines, authorized arbitration and chain freeze.

**Functional requirements & implementation checklist**

- [ ] FR-01: Define dispute state machine and privacy.
- [ ] FR-02: capture claims/evidence and notices.
- [ ] FR-03: verify deadline and arbiter.
- [ ] FR-04: prepare contract dispute/resolution invocation.
- [ ] FR-05: sync resolved allocations to orders.

**Technical requirements / integration contracts**

- `C-DISPUTE-03` (owner `F3-SERVER-005`, phase Fase 3): Dispute claims, private evidence, resolution and permitted allocations.
- `C-EVENT-03` (owner `F3-WEB3-002`, phase Fase 3): Event schemas for staged payouts, holds, resolutions and fees.
- `C-MILESTONE-03` (owner `F3-SERVER-004`, phase Fase 3): Milestone state/evidence/authorized approvers and release preparation.

**Dependencies and parallelization**

- `F3-SERVER-004` (`server`, BLOCKING / CONTRACT): Implement milestone/evidence and approver authority APIs. Needed deliverable: C-MILESTONE-03, C-ESCROW-03. Follow agreed interface; implementation order can overlap after contract review.
- `F3-WEB3-003` (`web3`, CONTRACT / INTEGRATION): Implement dispute freeze and authorized resolution allocations. Needed deliverable: C-ESCROW-03, C-DISPUTE-03. Start with approved mocks/specifications; integrate and verify before closing.

**Acceptance criteria**

- [ ] AC-01: Case cannot alter financial balance without signed chain event.
- [ ] AC-02: unauthorized reviewer denied.
- [ ] AC-03: refund only of available escrow.
- [ ] AC-INT: producer/consumer contract tests pass with the real counterpart; mock-only passing does not complete cross-repository integration.

**Testing requirements**

Dispute windows, allocation mismatches, RBAC and replay.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F20 Disputes & resolutions; source product master sections 4–11.
- Related task IDs: F3-SERVER-004, F3-WEB3-003.

### Feature: F21 Financial reconciliation & operations

**Resultado esperado:** Accurate accounting and fee disclosure.

**Feature acceptance:** Cada tarea hija se prueba; el flujo de usuario y el estado financiero/comercial deben permanecer consistentes después de integrar las tareas dependientes. No se considerará terminada por demos solo con mocks.

#### [F3-SERVER-006] Implement payment accounting, settlement reconciliation and fee ledger

**Metadata**

- **Milestone:** Fase 3
- **Feature:** F21 Financial reconciliation & operations
- **Project Type:** `server`
- **Priority:** `P0`
- **Work Type:** `feature`
- **Estimate:** `8` story points
- **Assignee:** Unassigned
- **Dependencies:** `F3-SERVER-003`, `F3-SERVER-004`, `F3-WEB3-004`, `MVP-SERVER-009`

**Description**

Separate GMV from platform income and reconcile escrow movements precisely.

**Functional requirements & implementation checklist**

- [ ] FR-01: Persist atomic ledger with integer token units, fee allocation and onchain refs.
- [ ] FR-02: reconcile funded/released/refunded/remaining.
- [ ] FR-03: handle provider settlements and invoices when enabled.
- [ ] FR-04: alert mismatches and delayed payouts.

**Technical requirements / integration contracts**

- `C-FINANCE-03` (owner `F3-SERVER-003`, phase Fase 3): Asset allowlist, fee snapshot and ledger event classifications.
- `C-EVENT-03` (owner `F3-WEB3-002`, phase Fase 3): Event schemas for staged payouts, holds, resolutions and fees.
- `C-OPS-03` (owner `F3-SERVER-006`, phase Fase 3): Reconciliation statuses, fee records and incident signal schemas.

**Dependencies and parallelization**

- `F3-SERVER-003` (`server`, BLOCKING / CONTRACT): Implement production asset and fee policy registry. Needed deliverable: C-FINANCE-03, C-COMPLIANCE-03. Follow agreed interface; implementation order can overlap after contract review.
- `F3-SERVER-004` (`server`, BLOCKING / CONTRACT): Implement milestone/evidence and approver authority APIs. Needed deliverable: C-MILESTONE-03, C-ESCROW-03. Follow agreed interface; implementation order can overlap after contract review.
- `F3-WEB3-004` (`web3`, CONTRACT / INTEGRATION): Audit, fuzz, deploy and publish production contract interfaces. Needed deliverable: C-ESCROW-03, C-EVENT-03. Start with approved mocks/specifications; integrate and verify before closing.
- `MVP-SERVER-009` (`server`, BLOCKING / CONTRACT): Index finalized escrow events with idempotent reconciliation. Needed deliverable: C-EVENT-01, C-ESCROW-01. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: Accounting identity holds for every lot.
- [ ] AC-02: duplicate event cannot change recognized income.
- [ ] AC-03: failed/refunded lots follow fee policy.
- [ ] AC-INT: producer/consumer contract tests pass with the real counterpart; mock-only passing does not complete cross-repository integration.

**Testing requirements**

Ledger property tests, duplicate/reorg tolerance and partial payouts.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F21 Financial reconciliation & operations; source product master sections 4–11.
- Related task IDs: F3-SERVER-003, F3-SERVER-004, F3-WEB3-004, MVP-SERVER-009.

### Feature: F22 Production safeguards

**Resultado esperado:** Operational controls and mainnet gating.

**Feature acceptance:** Cada tarea hija se prueba; el flujo de usuario y el estado financiero/comercial deben permanecer consistentes después de integrar las tareas dependientes. No se considerará terminada por demos solo con mocks.

#### [F3-SERVER-007] Implement audit trail, alerting and key/permission operations

**Metadata**

- **Milestone:** Fase 3
- **Feature:** F22 Production safeguards
- **Project Type:** `server`
- **Priority:** `P0`
- **Work Type:** `security`
- **Estimate:** `5` story points
- **Assignee:** Unassigned
- **Dependencies:** `F3-SERVER-001`, `F3-SERVER-006`

**Description**

Strengthen security and operational controls for real service readiness.

**Functional requirements & implementation checklist**

- [ ] FR-01: Add audit events immutable within application controls, 2FA for admin if supported, rate limiting and suspicious activity alerts.
- [ ] FR-02: secure secret management and backups.
- [ ] FR-03: define incident response and approval separation.

**Technical requirements / integration contracts**

- `C-OPS-03` (owner `F3-SERVER-006`, phase Fase 3): Reconciliation statuses, fee records and incident signal schemas.
- `C-COMPLIANCE-03` (owner `F3-SERVER-001`, phase Fase 3): Production gate, jurisdiction/asset policy, provider decision evidence.

**Dependencies and parallelization**

- `F3-SERVER-001` (`server`, BLOCKING / CONTRACT): Document regulated-money prerequisites and deployment gates. Needed deliverable: C-COMPLIANCE-03. Follow agreed interface; implementation order can overlap after contract review.
- `F3-SERVER-006` (`server`, BLOCKING / CONTRACT): Implement payment accounting, settlement reconciliation and fee ledger. Needed deliverable: C-FINANCE-03, C-EVENT-03. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: Privileged changes logged.
- [ ] AC-02: unauthorized signers cannot trigger money movement.
- [ ] AC-03: recovery tested before approval gate.

**Testing requirements**

Security scan, disaster restore, privilege escalation tabletop.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F22 Production safeguards; source product master sections 4–11.
- Related task IDs: F3-SERVER-001, F3-SERVER-006.

## Milestone: Fase 4 — Bolsa de demanda y marketplace

Solicitudes de compradores, interés no vinculante, cotizaciones, elección y conversión a una nueva oferta que exige aceptación y pago independientes.

### Feature: F23 Buyer demand requests

**Resultado esperado:** Non-binding buyer-generated requests.

**Feature acceptance:** Cada tarea hija se prueba; el flujo de usuario y el estado financiero/comercial deben permanecer consistentes después de integrar las tareas dependientes. No se considerará terminada por demos solo con mocks.

#### [F4-SERVER-001] Implement buyer demand request lifecycle and moderation

**Metadata**

- **Milestone:** Fase 4
- **Feature:** F23 Buyer demand requests
- **Project Type:** `server`
- **Priority:** `P0`
- **Work Type:** `feature`
- **Estimate:** `5` story points
- **Assignee:** Unassigned
- **Dependencies:** `F2-SERVER-001`, `F3-SERVER-007`

**Description**

Provide non-binding product requests without creating financial orders.

**Functional requirements & implementation checklist**

- [ ] FR-01: Model request category, target qty, region, dates, consent, status and moderation.
- [ ] FR-02: enforce ownership, spam throttles and privacy.
- [ ] FR-03: expose create/list/edit/archive.
- [ ] FR-04: distinguish estimate from commitment.

**Technical requirements / integration contracts**

- `C-DEMAND-04` (owner `F4-SERVER-001`, phase Fase 4): Non-binding buyer request schema and moderation states.
- `C-AUTH-01` (owner `MVP-SERVER-003`, phase MVP): Session/RBAC contracts, /me and organization scoping.

**Dependencies and parallelization**

- `F2-SERVER-001` (`server`, BLOCKING / CONTRACT): Implement organizations, membership and scoped permissions. Needed deliverable: C-ORG-02, C-AUTH-01. Follow agreed interface; implementation order can overlap after contract review.
- `F3-SERVER-007` (`server`, BLOCKING / CONTRACT): Implement audit trail, alerting and key/permission operations. Needed deliverable: C-OPS-03, C-COMPLIANCE-03. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: Public requests contain no sensitive PII.
- [ ] AC-02: expired requests closed.
- [ ] AC-03: creating request creates no order/payment.

**Testing requirements**

Spam/rate limit, PII redaction, lifecycle.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F23 Buyer demand requests; source product master sections 4–11.
- Related task IDs: F2-SERVER-001, F3-SERVER-007.

### Feature: F24 Demand pools & voting

**Resultado esperado:** Non-binding demand aggregation.

**Feature acceptance:** Cada tarea hija se prueba; el flujo de usuario y el estado financiero/comercial deben permanecer consistentes después de integrar las tareas dependientes. No se considerará terminada por demos solo con mocks.

#### [F4-SERVER-002] Implement deduplicated demand pools and expression-of-interest rules

**Metadata**

- **Milestone:** Fase 4
- **Feature:** F24 Demand pools & voting
- **Project Type:** `server`
- **Priority:** `P0`
- **Work Type:** `feature`
- **Estimate:** `5` story points
- **Assignee:** Unassigned
- **Dependencies:** `F4-SERVER-001`

**Description**

Aggregate interest separately from funded/reserved order counts.

**Functional requirements & implementation checklist**

- [ ] FR-01: Create interest records with per-user uniqueness and quantity hint.
- [ ] FR-02: deduplicate similar requests with moderation.
- [ ] FR-03: implement vote create/withdraw and anti-spam.
- [ ] FR-04: expose aggregates labeled non-binding.

**Technical requirements / integration contracts**

- `C-INTEREST-04` (owner `F4-SERVER-002`, phase Fase 4): Interest/votes and aggregates strictly separate from financial commitments.
- `C-DEMAND-04` (owner `F4-SERVER-001`, phase Fase 4): Non-binding buyer request schema and moderation states.
- `C-STATE-01` (owner `MVP-SERVER-001`, phase MVP): Separate commercial lot/order statuses from escrow states; confirmed-only totals.

**Dependencies and parallelization**

- `F4-SERVER-001` (`server`, BLOCKING / CONTRACT): Implement buyer demand request lifecycle and moderation. Needed deliverable: C-DEMAND-04, C-AUTH-01. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: Interest never increments contract funded or paid order.
- [ ] AC-02: double voting rejected.
- [ ] AC-03: private buyer data not leaked.

**Testing requirements**

Duplicate vote, withdrawal and financial isolation.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F24 Demand pools & voting; source product master sections 4–11.
- Related task IDs: F4-SERVER-001.

### Feature: F25 Operator quotations

**Resultado esperado:** Multiple competing offers and comparability.

**Feature acceptance:** Cada tarea hija se prueba; el flujo de usuario y el estado financiero/comercial deben permanecer consistentes después de integrar las tareas dependientes. No se considerará terminada por demos solo con mocks.

#### [F4-SERVER-003] Implement operator proposals and comparable quotation snapshots

**Metadata**

- **Milestone:** Fase 4
- **Feature:** F25 Operator quotations
- **Project Type:** `server`
- **Priority:** `P0`
- **Work Type:** `feature`
- **Estimate:** `5` story points
- **Assignee:** Unassigned
- **Dependencies:** `F4-SERVER-002`, `F3-SERVER-002`, `F2-SERVER-003`

**Description**

Enable multiple commercial operators to bid on the same demand.

**Functional requirements & implementation checklist**

- [ ] FR-01: Model quote variants, MOQ, landed-cost components, expiry, terms version.
- [ ] FR-02: enforce verified operator eligibility according to policy.
- [ ] FR-03: expose proposal CRUD and compare endpoint.
- [ ] FR-04: freeze accepted versions.

**Technical requirements / integration contracts**

- `C-QUOTE-04` (owner `F4-SERVER-003`, phase Fase 4): Operator quotes, cost breakdown, versioned selection rules.
- `C-CATALOG-02` (owner `F2-SERVER-003`, phase Fase 2): SKU variants, quotation snapshots and itemized prices.

**Dependencies and parallelization**

- `F4-SERVER-002` (`server`, BLOCKING / CONTRACT): Implement deduplicated demand pools and expression-of-interest rules. Needed deliverable: C-INTEREST-04, C-DEMAND-04. Follow agreed interface; implementation order can overlap after contract review.
- `F3-SERVER-002` (`server`, BLOCKING / CONTRACT): Implement KYC/KYB cases and protected document lifecycle. Needed deliverable: C-VERIFY-03, C-COMPLIANCE-03. Follow agreed interface; implementation order can overlap after contract review.
- `F2-SERVER-003` (`server`, BLOCKING / CONTRACT): Implement product variants and versioned price quotations. Needed deliverable: C-CATALOG-02, C-ORDER-02. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: Two operators can submit comparable quotes.
- [ ] AC-02: edited quote cannot silently alter accepted terms.
- [ ] AC-03: fees and dates explicit.

**Testing requirements**

Quote versioning, operator authorization and expiry.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F25 Operator quotations; source product master sections 4–11.
- Related task IDs: F4-SERVER-002, F3-SERVER-002, F2-SERVER-003.

### Feature: F26 Convert demand to funded lot

**Resultado esperado:** Fresh formal agreement and escrow from accepted quote.

**Feature acceptance:** Cada tarea hija se prueba; el flujo de usuario y el estado financiero/comercial deben permanecer consistentes después de integrar las tareas dependientes. No se considerará terminada por demos solo con mocks.

#### [F4-SERVER-004] Implement accepted quotation to new Collective Order conversion

**Metadata**

- **Milestone:** Fase 4
- **Feature:** F26 Convert demand to funded lot
- **Project Type:** `server`
- **Priority:** `P0`
- **Work Type:** `feature`
- **Estimate:** `8` story points
- **Assignee:** Unassigned
- **Dependencies:** `F4-SERVER-003`, `MVP-SERVER-005`, `F2-SERVER-004`

**Description**

Convert chosen quotation to *new* formal lot; require fresh buyer assent and payment.

**Functional requirements & implementation checklist**

- [ ] FR-01: Define transparent selection authorization and one-time conversion idempotency.
- [ ] FR-02: snapshot terms and pricing, create lot with sourceRequest.
- [ ] FR-03: notify interested users for independent opt-in.
- [ ] FR-04: never copy interests as orders.

**Technical requirements / integration contracts**

- `C-CONVERT-04` (owner `F4-SERVER-004`, phase Fase 4): Selected quotation→new lot and explicit buyer opt-in, no auto-pay.
- `C-LOT-01` (owner `MVP-SERVER-005`, phase MVP): Lot DTO, frozen terms hash, MOQ, token, UTC deadlines and policy snapshot.
- `C-ORDER-02` (owner `F2-SERVER-003`, phase Fase 2): Multi-item order, per-line prices and accepted terms.
- `C-DEMAND-04` (owner `F4-SERVER-001`, phase Fase 4): Non-binding buyer request schema and moderation states.

**Dependencies and parallelization**

- `F4-SERVER-003` (`server`, BLOCKING / CONTRACT): Implement operator proposals and comparable quotation snapshots. Needed deliverable: C-QUOTE-04, C-CATALOG-02. Follow agreed interface; implementation order can overlap after contract review.
- `MVP-SERVER-005` (`server`, BLOCKING / CONTRACT): Implement lot schema, policy snapshots and CRUD/publish. Needed deliverable: C-LOT-01, C-STATE-01. Follow agreed interface; implementation order can overlap after contract review.
- `F2-SERVER-004` (`server`, BLOCKING / CONTRACT): Implement reservations, capacity locking and expiration. Needed deliverable: C-RESERVE-02, C-STATE-01. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: Interest participants not automatically billed.
- [ ] AC-02: only accepted actual order counts toward MOQ.
- [ ] AC-03: conversion idempotent and auditable.

**Testing requirements**

Duplicate conversion, quote withdrawal, independent consent.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F26 Convert demand to funded lot; source product master sections 4–11.
- Related task IDs: F4-SERVER-003, MVP-SERVER-005, F2-SERVER-004.

### Feature: F27 Marketplace discovery & reputations

**Resultado esperado:** Searchable public offers and proven track record.

**Feature acceptance:** Cada tarea hija se prueba; el flujo de usuario y el estado financiero/comercial deben permanecer consistentes después de integrar las tareas dependientes. No se considerará terminada por demos solo con mocks.

#### [F4-SERVER-005] Implement searchable operator/lot marketplace and verified performance

**Metadata**

- **Milestone:** Fase 4
- **Feature:** F27 Marketplace discovery & reputations
- **Project Type:** `server`
- **Priority:** `P1`
- **Work Type:** `feature`
- **Estimate:** `8` story points
- **Assignee:** Unassigned
- **Dependencies:** `F4-SERVER-004`, `F3-SERVER-002`, `F2-SERVER-005`

**Description**

Allow discovering public operators and offers with sourced reputation stats.

**Functional requirements & implementation checklist**

- [ ] FR-01: Add indexed category/location/MOQ/terms search.
- [ ] FR-02: operator summary from completed verified operations.
- [ ] FR-03: allow ratings tied to real orders and moderation/correction.
- [ ] FR-04: prevent unverified allegation publication.

**Technical requirements / integration contracts**

- `C-MARKET-04` (owner `F4-SERVER-005`, phase Fase 4): Marketplace search, visibility and provenance of reputation.
- `C-VERIFY-03` (owner `F3-SERVER-002`, phase Fase 3): KYC/KYB state, private evidence access, verifier decisions.

**Dependencies and parallelization**

- `F4-SERVER-004` (`server`, BLOCKING / CONTRACT): Implement accepted quotation to new Collective Order conversion. Needed deliverable: C-CONVERT-04, C-LOT-01. Follow agreed interface; implementation order can overlap after contract review.
- `F3-SERVER-002` (`server`, BLOCKING / CONTRACT): Implement KYC/KYB cases and protected document lifecycle. Needed deliverable: C-VERIFY-03, C-COMPLIANCE-03. Follow agreed interface; implementation order can overlap after contract review.
- `F2-SERVER-005` (`server`, BLOCKING / CONTRACT): Implement order reports and organization-scoped aggregation. Needed deliverable: C-REPORT-02, C-STATE-01. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: No fabricated ratings.
- [ ] AC-02: private lots excluded.
- [ ] AC-03: search paginated.
- [ ] AC-04: only actual completed orders affect stats.

**Testing requirements**

Search ACL, review legitimacy, index synchronization.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F27 Marketplace discovery & reputations; source product master sections 4–11.
- Related task IDs: F4-SERVER-004, F3-SERVER-002, F2-SERVER-005.

### Feature: F28 Marketplace fee attribution & analytics

**Resultado esperado:** Source-aware conversion and fee reporting.

**Feature acceptance:** Cada tarea hija se prueba; el flujo de usuario y el estado financiero/comercial deben permanecer consistentes después de integrar las tareas dependientes. No se considerará terminada por demos solo con mocks.

#### [F4-SERVER-006] Implement customer-source attribution and conversion accounting

**Metadata**

- **Milestone:** Fase 4
- **Feature:** F28 Marketplace fee attribution & analytics
- **Project Type:** `server`
- **Priority:** `P1`
- **Work Type:** `feature`
- **Estimate:** `5` story points
- **Assignee:** Unassigned
- **Dependencies:** `F4-SERVER-004`, `F3-SERVER-006`

**Description**

Support fee separation for operator-owned vs marketplace-sourced clients.

**Functional requirements & implementation checklist**

- [ ] FR-01: Persist source tracking with consent and expiration policy.
- [ ] FR-02: record quotation/request/lot conversion funnel.
- [ ] FR-03: define fee eligibility only for successful transaction per policy.
- [ ] FR-04: export analytics by source.

**Technical requirements / integration contracts**

- `C-ATTRIB-04` (owner `F4-SERVER-006`, phase Fase 4): Acquisition attribution, conversions and fee trigger classification.
- `C-FINANCE-03` (owner `F3-SERVER-003`, phase Fase 3): Asset allowlist, fee snapshot and ledger event classifications.

**Dependencies and parallelization**

- `F4-SERVER-004` (`server`, BLOCKING / CONTRACT): Implement accepted quotation to new Collective Order conversion. Needed deliverable: C-CONVERT-04, C-LOT-01. Follow agreed interface; implementation order can overlap after contract review.
- `F3-SERVER-006` (`server`, BLOCKING / CONTRACT): Implement payment accounting, settlement reconciliation and fee ledger. Needed deliverable: C-FINANCE-03, C-EVENT-03. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: Votes and GMV not counted as revenue.
- [ ] AC-02: no fee on abandoned interest.
- [ ] AC-03: attribution disputes auditable.

**Testing requirements**

Attribution dedupe, fee trigger and privacy.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F28 Marketplace fee attribution & analytics; source product master sections 4–11.
- Related task IDs: F4-SERVER-004, F3-SERVER-006.

## Reglas de cierre del milestone

- **MVP:** Las dos rutas de escrow deben ejecutarse con transacciones Testnet observables; la UI no debe afirmar compra física ni dinero real.
- **Fase 2:** El operador puede administrar lotes privados y medir reservas vs fondos; métricas del piloto distinguen demos y operaciones observadas.
- **Fase 3:** No se permiten pagos mainnet reales sin revisión legal, auditoría técnica y gate de producción; el saldo nunca se mueve por mera decisión off-chain.
- **Fase 4:** La demanda no vinculante solo se convierte a lote mediante nueva oferta y aceptación explícita; las propuestas compiten con criterios documentados.

## Auditoría de dependencias

- Total tasks in this file: **33**.
- Cada referencia a task ID y contrato es resoluble contra los otros dos archivos.
- Ninguna tarea depende de fases posteriores ni existen ciclos de dependencias blocking/contract entre tareas.
- Los contratos futuros de Fase 3 no se consideran habilitados por haber terminado Testnet MVP.
- Puntos por ratificar: autoridad de payout y reclamos, metodología de costeo final, KYB/KYC real, operador de custodia, tarifas, integración con rampas y jurisdicción.
