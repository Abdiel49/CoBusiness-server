# GitHub Backlog — WEB3 — Stellar / Soroban Rust

> **Estado:** backlog propuesto para implementación; no acredita funcionalidades existentes ni aprobación de reglas comerciales.
> **Fuentes:** `Documento_Rector_Comercio_Colectivo_v0.4.docx.md`, `Guia_sondeo_importadores.docx.md`, `Proyecto final.md`, `Proyecto_Unificado_Comercio_Colectivo_Stellar_v1.md`, y la especificación Product/Roadmap compartida en la conversación.
> **Convención:** títulos, funcionalidades y campos de issues en inglés técnico; explicaciones de gobierno en español.

## Ajuste de alcance — 2026-11-20

**Fuente vigente:** [Guía de desarrollo de la demo v1.0](proyectos/comercio-colectivo/guias/Guia_desarrollo_demo_CoBusiness_v1.0.md) y cierre de etapa acordado con el propietario. Este ajuste no acredita implementación ni ratificación adicional del equipo.

- **Demo:** operador ficticio, oferta precargada, KYC/KYB simulados y datos ficticios. Bloques enteros configurables; 1.000 termos / bloques de 100 es ejemplo, no constante.
- **Éxito:** condiciones aceptadas → aporte Testnet → meta confirmada → ratificación comercial del operador dentro de 24 horas desde meta → autorización CoBusiness → desembolso a wallet operador. Meta sola no paga.
- **Devolución:** CoBusiness habilita y cada comprador reclama. Motivos previstos: meta incompleta al vencer recaudación; negativa inmediata del operador; falta de respuesta en 24 horas. El equipo elige UNA variante preparada para demostrar; no se exige implementar todas ni presentarlas como disponibles si no lo están.
- **Documentos:** condiciones antes del aporte, constancia individual con estado del pago, documento consolidado de ejemplo al pasar a ejecución. No se exige instrumentación jurídica definitiva.
- **Pollar:** orientación por defecto sujeta a prueba wallet/firma; KYC simulado y saldo Testnet preparado bastan. No exigir rampa BOB real ni puente.
- **Contrato propio mínimo:** propuesta preferida del propietario, PENDIENTE DE CONSENSO. WEB3 describe esa vía condicionalmente; no la ratifica. Trustless Work no es dependencia obligatoria. Motivo central: controlar costos y ajustar reglas; contrato propio no elimina costos de red/desarrollo.
- **Ingresos:** propuesta de suscripción base y comisión de éxito a cargo del operador, no comprador. Comisión CoBusiness cero en devolución; si se representa reparto, tasa ilustrativa y neto del operador. Sin cobros reales ni tarifa comercial fijada.
- **Fuera de demo:** creación completa de ofertas/onboarding, logística/chat, dinero real, disputas exhaustivas y producción. Fases 2–4 permanecen como roadmap histórico propuesto, NO ratificado ni requisito de presentación; sus P0 son relativos a cada fase.
- **Criterio de desarrollo:** stack/arquitectura (incluidos NestJS/PostgreSQL propuestos), activo/precio, modalidad de firma, representación de roles y preparación de escenarios. No reabrir inacción de plataforma u otras excepciones como bloqueos.

IDs, dependencias y estimaciones se conservan para trazabilidad; desarrollo revisará estimaciones al concretar el alcance. Ninguna casilla se marca completada. Originales y procedencia: `proyectos/comercio-colectivo/documentos/backlogs-equipo/2026-11-20/`.

## Reglas comunes para GitHub

- **Milestones (exactos):** `MVP`, `Fase 2`, `Fase 3`, `Fase 4` (GitHub milestones son por repositorio).
- **Etiqueta obligatoria de repositorio:** `web3` y solo una de `web`, `server`, `web3` por issue técnica.
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
| `C-DEPLOY-01` | `MVP-WEB3-007` | Testnet passphrase, RPC, token ID, contract ID, explorer and tagged ABI | Web config; Server env; Web3 release |
| `C-ESCROW-01` | `MVP-WEB3-001` | Proposed ABI v1: whole-block funding, goal timestamp, CoBusiness release/refund enablement, individual claims and getters | Web wallet; Server adapter; Web3 contract |
| `C-EVENT-01` | `MVP-WEB3-001` | Escrow event topics/data, unique identity, contract/network and version | Server indexer; Web receipts; Web3 emits |
| `C-LOT-01` | `MVP-SERVER-005` | Preloaded whole-block lot DTO, frozen terms, token, funding and 24h response deadlines | Web lot pages; Server lot creation; Web3 terms hash |
| `C-STATE-01` | `MVP-SERVER-001` | Separate commercial lot/order statuses from escrow states; confirmed-only totals | Web read models; Server indexer; Web3 events |
| `C-COMPLIANCE-03` | `F3-SERVER-001` | Production gate, jurisdiction/asset policy, provider decision evidence | Web production gating; Server deploy policy; Web3 audit |
| `C-DEPLOY-03` | `F3-WEB3-004` | Approved audited ABI/wasm/checksum, network and deployment tags | Server environment; Web wallet config |
| `C-DISPUTE-03` | `F3-SERVER-005` | Dispute claims, private evidence, resolution and permitted allocations | Web dispute workflow; Server arbitration; Web3 hold |
| `C-ESCROW-03` | `F3-WEB3-001` | Escrow ABI v2 and migration policy for milestones, disputes and partial refunds | Web signing; Server operations; Web3 contract |
| `C-EVENT-03` | `F3-WEB3-002` | Event schemas for staged payouts, holds, resolutions and fees | Server ledger; Web status; Web3 emits |
| `C-FINANCE-03` | `F3-SERVER-003` | Asset allowlist, fee snapshot and ledger event classifications | Web fee disclosure; Server ledger; Web3 accounting |
| `C-MILESTONE-03` | `F3-SERVER-004` | Milestone state/evidence/authorized approvers and release preparation | Web reviewers; Server workflow; Web3 stage payout |
| `C-CONVERT-04` | `F4-SERVER-004` | Selected quotation→new lot and explicit buyer opt-in, no auto-pay | Web opt-in; Server conversion; Web3 unchanged escrow |

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

## Integration Contract Annex — demo baseline v0.2 (proposed)

Anexo idéntico en los tres backlogs. DISEÑO PROPUESTO, no API/ABI desplegada. SERVER-001 / WEB3-001 concretan nombres, firmas y fixtures versionados. Contrato propio pendiente de consenso; no se impone stack nuevo.

### A. Representation, identity, consistency

- IDs comerciales opacos con mapping inmutable a red/contrato/activo/chainLotId. Importes JSON como strings de unidades mínimas enteras; verificar decimales, sin coma flotante.
- Oferta: `unitsPerBlock, totalBlocks, blockPriceMinor, fundingDeadline`. Pedido: `blockCount` entero positivo; unidades = bloques × unidades/bloque; importe = bloques × precio/bloque. Meta = totalBlocks × blockPriceMinor. Porcentaje derivado, no necesariamente 10 %.
- Cupo y múltiplos se validan también en contrato si se adopta vía propia; no basta backend ante concurrencia. Pendientes/intentos no incrementan financiado.
- Fechas UTC en API; timestamp de ledger en contrato. `goalReachedAt` corresponde al aporte confirmado que completa meta; `operatorResponseDeadline = goalReachedAt + 86400`. No reiniciar al leer notificación ni fingir vencimiento con reloj visual.
- `termsHash`: serialización canónica versionada de bloques, precios, activo, plazos, destinatarios y políticas. Condiciones conocidas/aceptadas antes del aporte y sin modificación unilateral posterior.
- Sesión, KYC simulado, prueba de wallet y autorización de tokens son distintos. CoBusiness autoriza desembolso/habilitación de devolución. Rol REST no sustituye firma on-chain. Equipo decide representación de ratificación comercial: si off-chain, no anunciar firma on-chain del operador ni verificación física.

### B. MVP API baseline (`C-API-01`)

Rutas ilustrativas a concretar en OpenAPI. Sin formulario/CRUD público obligatorio de ofertas; seed/configuración reproducible más lectura.

| Operación propuesta | Datos / resultado | Dueño |
|---|---|---|
| Acceso / me | roles, identidad ficticia y KYC simulated; sin documentos reales | MVP-SERVER-003 |
| Lectura operador/producto | revisión simulada y condiciones comerciales/entrega | MVP-SERVER-004 |
| GET lots / lots/:id | bloques, precio, activo, condiciones, progreso confirmado y plazos | MVP-SERVER-005 |
| POST lots/:id/orders; GET orders/:id | blockCount, acceptedTermsVersion, idempotencyKey; cantidad/importe y constancia individual | MVP-SERVER-006 |
| Wallet challenge/verify | nonce, red, expiración y prueba soportada por modalidad elegida; Pollar sujeto a prueba | MVP-SERVER-007 |
| Payment intent / submission | invocación sin firmar y txHash; submitted NO es funded | MVP-SERVER-008 |
| Estado escrow/payment | balances confirmados, timestamps y última sincronización | MVP-SERVER-009 |
| Respuesta del operador | continuidad/negativa, fecha, procedencia y simulación comercial | MVP-SERVER-010 |
| Preparar autorización CoBusiness | desembolso o habilitación de devolución, causa, términos e invocación sin firmar | MVP-SERVER-010 |
| Documento consolidado de ejemplo | habilitación automática tras desembolso confirmado, referencia tx y términos | MVP-SERVER-010 |
| Refund eligibility / prepare claim | elegible vs habilitado, aporte propio no devuelto e invocación sin firmar | MVP-SERVER-011 |
| Auditoría admin | lectura, sin edición de balances | MVP-SERVER-012 |

Errores estables sin PII/secretos: LOT_NOT_OPEN, INVALID_BLOCK_COUNT, INSUFFICIENT_BLOCKS, TERMS_VERSION_MISMATCH, WRONG_NETWORK, UNAUTHORIZED, REFUND_NOT_ENABLED. Publicar DTO/códigos HTTP. Reintentos idempotentes; documentos/pedidos privados accesibles solo a participantes autorizados.

### C. State contracts (`C-STATE-01`)

Comercial propuesto: collecting → goal_reached_awaiting_operator → operator_confirmed → release_authorized → execution. Execution NO significa entrega física. Equipo concreta transiciones atómicas/separadas.

Financiero: funding → funded_awaiting_approval → released. Alternativa elegible antes de desembolso: refund_eligible → refund_enabled → refunds_in_progress → refunded. Elegibilidad no es habilitación y habilitación no es transferencia. Orden: intent → submitted → funded → execution o refunded, sin marcar entrega física.

Motivos previstos: meta incompleta vencida; negativa del operador sin esperar 24 horas; falta de respuesta tras 24 horas desde meta. Solo variante elegida exige integración E2E ahora. CoBusiness habilita; comprador reclama individualmente sin doble pago ni recuperación de dinero ya desembolsado.

Contabilidad exacta: confirmedDeposits = operatorNetPaid + platformFeePaid + refunded + remainingBalance. Si no se representa comisión, platformFeePaid=0 y se indica; si se representa, congelar tasa ilustrativa/base/redondeo y descontar al operador solo en éxito. Bruto = neto + comisión. No fijar tarifa comercial ni costos externos.

### D. Soroban ABI and events (`C-ESCROW-01`, `C-EVENT-01`)

Si se adopta contrato propio, WEB3 publicará ABI real. Capacidades conceptuales, NO firmas Rust definitivas:

```text
init_lot(blocks, price, asset, funding deadline, operator,
         CoBusiness authority, terms hash, optional illustrative fee policy)
contribute(lot, payer, order reference, block count)
get_lot / get_contribution
approve_release / release (CoBusiness auth, eligible state, fixed recipients)
enable_refunds (CoBusiness auth, selected reason and eligibility)
claim_refund (payer auth, own unrefunded contribution)
```

Registrar meta/plazos con aporte que la completa; impedir fracciones/sobrecupo y doble desembolso. Fondos retenidos hasta autorización CoBusiness. Ratificación y evidencia comercial según política técnica explícita; no oráculo de mercancía. Usar require_auth/autorización soportada en actores pertinentes, no flags HTTP. Equipo decide múltiples pedidos por wallet o restricción documentada coherente en los tres componentes.

Eventos conceptuales: ContributionConfirmed, GoalReached, ReleaseApproved, FundsReleased, RefundsEnabled, RefundClaimed y comisión si se representa. Esquema versionado; txHash/secuencia/hora ledger pueden ser metadatos del indexador, no datos conocidos por contrato. Identidad única network/contractId/txHash/eventOrdinal o cursor canónico. Solo evidencia on-chain compatible confirma dinero; documentar TTL suficiente para demo/reclamos.

### D.1 Precisiones técnicas verificadas mediante Raven — 2026-11-20

- Preparar cada invocación con simulación RPC (`simulateTransaction` o helper compatible del SDK) antes de las firmas finales; incorporar recursos, footprint y autorizaciones requeridas. La simulación técnica no sustituye autorización ni confirma un pago. WEB/SERVER acuerdan quién prepara; no duplicar responsabilidades ni presuponer soporte Pollar.
- `sendTransaction` aceptada/pendiente no significa éxito. Consultar resultado confirmado (`getTransaction` o helper compatible); `NOT_FOUND` y agotamiento del polling no prueban fracaso. Conservar hash y límites temporales; no construir otro pago mientras el anterior aún pueda incluirse. Antes de reconstruir, verificar fallo definitivo o expiración confirmada por ledger y conciliar el pedido, sin duplicar aporte.
- Autoridad: comprador autoriza su aporte y reclamo; CoBusiness autoriza desembolso al operador o habilitación de devolución. El rol HTTP no sustituye autorización del contrato (`require_auth` o mecanismo compatible).

Contraste documental, no prueba de integración. Fuentes y límites: [revisión Raven](proyectos/comercio-colectivo/documentos/backlogs-equipo/2026-11-20/revision-raven.md). No modifica acuerdos comerciales ni exige otras variantes de devolución.

### E. Integration sequencing and demo closure

1. Equipo concreta vía escrow, wallet/firma y variante de devolución sin ampliar alcance. SERVER-001 / WEB3-001 publican interfaces; WEB avanza con mocks identificados.
2. Trabajo paralelo con interfaces versionadas; probar Pollar sin presuponer integración ni exigir rampa real. Documentar modalidad/alternativa elegida por desarrollo.
3. WEB3-007 entrega artefactos Testnet si se adopta esa vía; SERVER indexa y WEB firma con wallet real Testnet. Aportes previos solo son confirmados si existen on-chain.
4. Éxito: oferta precargada → bloques/condiciones → aporte → meta → ratificación simulada dentro de 24 horas → autorización CoBusiness → pago Testnet operador → documento de ejemplo.
5. Devolución: operación preparada elegida → habilitación CoBusiness → reclamo → tx confirmada. Si usa plazo vencido, preparar vencimiento real; no cambiar solo reloj visual.
6. No exigir demostrar todas las excepciones, esperar en vivo ni construir fases futuras. Mocks no cierran integración financiera; simulado es contenido comercial/KYC, no tx presentada como real.

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
| `MVP-WEB3-001` | F01 Architecture & contracts | P0 | 5 | `MVP-SERVER-001` |
| `MVP-WEB3-002` | F01 Architecture & contracts | P0 | 3 | — |
| `MVP-WEB3-003` | F05 Escrow core | P0 | 5 | — |
| `MVP-WEB3-004` | F05 Escrow core | P0 | 5 | — |
| `MVP-WEB3-005` | F05 Escrow core | P0 | 5 | — |
| `MVP-WEB3-006` | F05 Escrow core | P0 | 5 | — |
| `MVP-WEB3-007` | F05 Escrow core | P0 | 5 | — |
| `MVP-WEB3-008` | F10 Demo verification & observability | P0 | 5 | — |
| `F2-WEB3-001` | F16 Escrow lifecycle reliability | P1 | 5 | — |
| `F3-WEB3-001` | F18 Production financial controls | P0 | 8 | `F3-SERVER-001` |
| `F3-WEB3-002` | F19 Milestone payments | P0 | 8 | — |
| `F3-WEB3-003` | F19 Milestone payments | P0 | 8 | — |
| `F3-WEB3-004` | F19 Milestone payments | P0 | 8 | `F3-SERVER-001` |
| `F4-WEB3-001` | F26 Convert demand to funded lot | P1 | 3 | `F4-SERVER-004` |

## Milestone: MVP — Prototipo hackathon — Stellar Testnet

Demo acotada: oferta precargada, bloques, meta, ratificación simulada, autorización CoBusiness y pago Testnet; otra operación con habilitación y reclamo individual. Sin dinero ni entregas reales.

### Feature: F01 Architecture & contracts

**Resultado esperado:** Common architecture, authoritative schema/ABI and deployment tools.

**Feature acceptance:** Cada tarea hija se prueba; el flujo de usuario y el estado financiero/comercial deben permanecer consistentes después de integrar las tareas dependientes. No se considerará terminada por demos solo con mocks.

#### [MVP-WEB3-001] Specify minimal escrow ABI conditional on team consensus

**Metadata**

- **Milestone:** MVP
- **Feature:** F01 Architecture & contracts
- **Project Type:** `web3`
- **Priority:** `P0`
- **Work Type:** `documentation`
- **Estimate:** `5` story points
- **Assignee:** Unassigned
- **Dependencies:** `MVP-SERVER-001`

**Description**

Ajustada a guía demo v1.0; propuesta de implementación, no tarea completada. Alcance detallado a continuación.

**Functional requirements & implementation checklist**

- [ ] FR-01: Documentar adopción por equipo: contrato propio es propuesta del propietario no ratificada.
- [ ] FR-02: Concretar ABI/storage/eventos para bloques/cupo/meta, respuesta 24h y autorización CoBusiness.
- [ ] FR-03: Definir habilitación y reclamo individual de variante preparada sin exigir todas las excepciones.
- [ ] FR-04: Definir importes, TTL, términos y comisión ilustrativa si se representa; no imponer demo fee-free.
- [ ] FR-05: Documentar ratificación comercial on/off-chain sin afirmar verificación física.

**Technical requirements / integration contracts**

- `C-ESCROW-01` (owner `MVP-WEB3-001`, phase MVP): Proposed ABI v1: whole-block funding, goal timestamp, CoBusiness release/refund enablement, individual claims and getters.
- `C-EVENT-01` (owner `MVP-WEB3-001`, phase MVP): Escrow event topics/data, unique identity, contract/network and version.
- `C-STATE-01` (owner `MVP-SERVER-001`, phase MVP): Separate commercial lot/order statuses from escrow states; confirmed-only totals.

**Dependencies and parallelization**

- `MVP-SERVER-001` (`server`, CONTRACT / INTEGRATION): Define shared product, API, and financial state contracts. Needed deliverable: C-API-01, C-STATE-01. Start with approved mocks/specifications; integrate and verify before closing.

**Acceptance criteria**

- [ ] AC-01: ABI cubre bloques/cupo y separación meta/ratificación/autorización/pago.
- [ ] AC-02: Equipo concreta detalles sin reabrir análisis comercial.
- [ ] AC-INT: Integración financiera real Testnet antes de cierre; mocks identificados solo habilitan trabajo paralelo.

**Testing requirements**

Verificar criterios anteriores y controles básicos del flujo implementado; evidencia Testnet cuando corresponde. No exigir excepciones fuera de alcance.

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

#### [MVP-WEB3-002] Bootstrap Rust/Soroban workspace and Testnet pipeline

**Metadata**

- **Milestone:** MVP
- **Feature:** F01 Architecture & contracts
- **Project Type:** `web3`
- **Priority:** `P0`
- **Work Type:** `infrastructure`
- **Estimate:** `3` story points
- **Assignee:** Unassigned
- **Dependencies:** `MVP-WEB3-001`

**Description**

Set up contract project, dependency pinning, toolchain, build and test workflow.

**Functional requirements & implementation checklist**

- [ ] FR-01: Configure Cargo and Soroban SDK versions.
- [ ] FR-02: implement CI compile lint unit tests and wasm size reports.
- [ ] FR-03: parameterize network passphrase and test asset.
- [ ] FR-04: document deterministic deployments.

**Technical requirements / integration contracts**

- `C-ESCROW-01` (owner `MVP-WEB3-001`, phase MVP): Proposed ABI v1: whole-block funding, goal timestamp, CoBusiness release/refund enablement, individual claims and getters.

**Dependencies and parallelization**

- `MVP-WEB3-001` (`web3`, BLOCKING / CONTRACT): Specify minimal escrow ABI conditional on team consensus. Needed deliverable: C-ESCROW-01, C-EVENT-01. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: Contract builds and tests in clean environment.
- [ ] AC-02: no private keys committed.
- [ ] AC-03: Testnet configurations separate.

**Testing requirements**

cargo test, build and CI smoke.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F01 Architecture & contracts; source product master sections 4–11.
- Related task IDs: MVP-WEB3-001.

### Feature: F05 Escrow core

**Resultado esperado:** Secure token accounting, approval, release and refund.

**Feature acceptance:** Cada tarea hija se prueba; el flujo de usuario y el estado financiero/comercial deben permanecer consistentes después de integrar las tareas dependientes. No se considerará terminada por demos solo con mocks.

#### [MVP-WEB3-003] Initialize block-based escrow and exact policy snapshots

**Metadata**

- **Milestone:** MVP
- **Feature:** F05 Escrow core
- **Project Type:** `web3`
- **Priority:** `P0`
- **Work Type:** `feature`
- **Estimate:** `5` story points
- **Assignee:** Unassigned
- **Dependencies:** `MVP-WEB3-002`, `MVP-WEB3-001`

**Description**

Ajustada a guía demo v1.0; propuesta de implementación, no tarea completada. Alcance detallado a continuación.

**Functional requirements & implementation checklist**

- [ ] FR-01: Inicializar una vez con bloques/precio/token/plazo/direcciones configurados.
- [ ] FR-02: Importes enteros/overflow comprobado, términos inmutables y segregación por oferta.
- [ ] FR-03: Configurar autoridad CoBusiness y operador; congelar tasa/base/redondeo/destino de comisión ilustrativa si aplica.
- [ ] FR-04: Exponer getters de bloques, balances y timestamps.

**Technical requirements / integration contracts**

- `C-ESCROW-01` (owner `MVP-WEB3-001`, phase MVP): Proposed ABI v1: whole-block funding, goal timestamp, CoBusiness release/refund enablement, individual claims and getters.
- `C-STATE-01` (owner `MVP-SERVER-001`, phase MVP): Separate commercial lot/order statuses from escrow states; confirmed-only totals.

**Dependencies and parallelization**

- `MVP-WEB3-002` (`web3`, BLOCKING / CONTRACT): Bootstrap Rust/Soroban workspace and Testnet pipeline. Needed deliverable: C-ESCROW-01. Follow agreed interface; implementation order can overlap after contract review.
- `MVP-WEB3-001` (`web3`, BLOCKING / CONTRACT): Specify minimal escrow ABI conditional on team consensus. Needed deliverable: C-ESCROW-01, C-EVENT-01. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: Init duplicado/configuración inválida no altera fondos; meta = totalBlocks × blockPriceMinor.

**Testing requirements**

Verificar criterios anteriores y controles básicos del flujo implementado; evidencia Testnet cuando corresponde. No exigir excepciones fuera de alcance.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F05 Escrow core; source product master sections 4–11.
- Related task IDs: MVP-WEB3-002, MVP-WEB3-001.

#### [MVP-WEB3-004] Implement whole-block contributions, cap and goal timestamp

**Metadata**

- **Milestone:** MVP
- **Feature:** F05 Escrow core
- **Project Type:** `web3`
- **Priority:** `P0`
- **Work Type:** `feature`
- **Estimate:** `5` story points
- **Assignee:** Unassigned
- **Dependencies:** `MVP-WEB3-003`

**Description**

Ajustada a guía demo v1.0; propuesta de implementación, no tarea completada. Alcance detallado a continuación.

**Functional requirements & implementation checklist**

- [ ] FR-01: Autorizar pagador y transferencia compatible; solo transferencias exitosas cuentan.
- [ ] FR-02: Exigir blockCount entero positivo/precio exacto; impedir fracciones, sobrecupo y doble referencia.
- [ ] FR-03: Completar meta cierra aportes y fija goalReachedAt y plazo +86400 segundos, sin liberar.
- [ ] FR-04: Rechazar aportes fuera de recaudación o activo/términos incorrectos.

**Technical requirements / integration contracts**

- `C-ESCROW-01` (owner `MVP-WEB3-001`, phase MVP): Proposed ABI v1: whole-block funding, goal timestamp, CoBusiness release/refund enablement, individual claims and getters.
- `C-EVENT-01` (owner `MVP-WEB3-001`, phase MVP): Escrow event topics/data, unique identity, contract/network and version.
- `C-STATE-01` (owner `MVP-SERVER-001`, phase MVP): Separate commercial lot/order statuses from escrow states; confirmed-only totals.

**Dependencies and parallelization**

- `MVP-WEB3-003` (`web3`, BLOCKING / CONTRACT): Initialize block-based escrow and exact policy snapshots. Needed deliverable: C-ESCROW-01, C-STATE-01. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: Aportes concurrentes no exceden cupo; fallo no cambia balance.
- [ ] AC-02: Timestamps derivan del ledger, no reloj frontend.

**Testing requirements**

Verificar criterios anteriores y controles básicos del flujo implementado; evidencia Testnet cuando corresponde. No exigir excepciones fuera de alcance.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F05 Escrow core; source product master sections 4–11.
- Related task IDs: MVP-WEB3-003.

#### [MVP-WEB3-005] Implement CoBusiness-authorized payout after operator confirmation

**Metadata**

- **Milestone:** MVP
- **Feature:** F05 Escrow core
- **Project Type:** `web3`
- **Priority:** `P0`
- **Work Type:** `feature`
- **Estimate:** `5` story points
- **Assignee:** Unassigned
- **Dependencies:** `MVP-WEB3-004`

**Description**

Ajustada a guía demo v1.0; propuesta de implementación, no tarea completada. Alcance detallado a continuación.

**Functional requirements & implementation checklist**

- [ ] FR-01: Exigir meta y ratificación comercial válida dentro de 24h según política explícita del equipo.
- [ ] FR-02: Autorizar CoBusiness y pagar solo wallet operador configurada.
- [ ] FR-03: Impedir doble desembolso e incompatibilidad con devolución habilitada.
- [ ] FR-04: Si hay comisión ilustrativa, descontarla al operador solo en éxito y emitir importes conciliables.

**Technical requirements / integration contracts**

- `C-ESCROW-01` (owner `MVP-WEB3-001`, phase MVP): Proposed ABI v1: whole-block funding, goal timestamp, CoBusiness release/refund enablement, individual claims and getters.
- `C-EVENT-01` (owner `MVP-WEB3-001`, phase MVP): Escrow event topics/data, unique identity, contract/network and version.
- `C-STATE-01` (owner `MVP-SERVER-001`, phase MVP): Separate commercial lot/order statuses from escrow states; confirmed-only totals.

**Dependencies and parallelization**

- `MVP-WEB3-004` (`web3`, BLOCKING / CONTRACT): Implement whole-block contributions, cap and goal timestamp. Needed deliverable: C-ESCROW-01, C-EVENT-01. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: Meta/respuesta sin CoBusiness no pagan.
- [ ] AC-02: Bruto = neto + comisión si aplica; sin destinatario arbitrario.

**Testing requirements**

Verificar criterios anteriores y controles básicos del flujo implementado; evidencia Testnet cuando corresponde. No exigir excepciones fuera de alcance.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F05 Escrow core; source product master sections 4–11.
- Related task IDs: MVP-WEB3-004.

#### [MVP-WEB3-006] Implement CoBusiness refund enablement and individual claims

**Metadata**

- **Milestone:** MVP
- **Feature:** F05 Escrow core
- **Project Type:** `web3`
- **Priority:** `P0`
- **Work Type:** `feature`
- **Estimate:** `5` story points
- **Assignee:** Unassigned
- **Dependencies:** `MVP-WEB3-004`

**Description**

Ajustada a guía demo v1.0; propuesta de implementación, no tarea completada. Alcance detallado a continuación.

**Functional requirements & implementation checklist**

- [ ] FR-01: Validar condición de variante elegida y autorización CoBusiness para habilitar.
- [ ] FR-02: Otras causas comerciales quedan registradas como no implementadas si corresponde, sin bloquear demo.
- [ ] FR-03: Comprador reclama aporte propio no devuelto tras habilitación, sin nueva aprobación individual.
- [ ] FR-04: Emitir eventos; impedir doble pago o devolución de dinero liberado.
- [ ] FR-05: No descontar comisión CoBusiness por fracaso; costos externos separados si aplican.

**Technical requirements / integration contracts**

- `C-ESCROW-01` (owner `MVP-WEB3-001`, phase MVP): Proposed ABI v1: whole-block funding, goal timestamp, CoBusiness release/refund enablement, individual claims and getters.
- `C-EVENT-01` (owner `MVP-WEB3-001`, phase MVP): Escrow event topics/data, unique identity, contract/network and version.
- `C-STATE-01` (owner `MVP-SERVER-001`, phase MVP): Separate commercial lot/order statuses from escrow states; confirmed-only totals.

**Dependencies and parallelization**

- `MVP-WEB3-004` (`web3`, BLOCKING / CONTRACT): Implement whole-block contributions, cap and goal timestamp. Needed deliverable: C-ESCROW-01, C-EVENT-01. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: Elegibilidad/habilitación/transferencia son distintos.
- [ ] AC-02: Tras habilitación reclamo invocable directo sin nueva autorización backend.
- [ ] AC-03: Balances concilian; segundo reclamo no paga.

**Testing requirements**

Verificar criterios anteriores y controles básicos del flujo implementado; evidencia Testnet cuando corresponde. No exigir excepciones fuera de alcance.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F05 Escrow core; source product master sections 4–11.
- Related task IDs: MVP-WEB3-004.

#### [MVP-WEB3-007] Publish Testnet deployment artifacts and executable fixtures

**Metadata**

- **Milestone:** MVP
- **Feature:** F05 Escrow core
- **Project Type:** `web3`
- **Priority:** `P0`
- **Work Type:** `infrastructure`
- **Estimate:** `5` story points
- **Assignee:** Unassigned
- **Dependencies:** `MVP-WEB3-005`, `MVP-WEB3-006`

**Description**

Si se adopta contrato propio, preparar artefactos Testnet y fixtures de éxito y UNA devolución elegida. Este ajuste documental no ejecuta ni autoriza despliegue en esta sesión.

**Functional requirements & implementation checklist**

- [ ] FR-01: Deploy wasm to Testnet with explicit passphrase.
- [ ] FR-02: create Testnet demo asset and faucet instructions.
- [ ] FR-03: expose verified contract ID, ABI schema and events.
- [ ] FR-04: write scripts for success/failure demo and contract state checks.

**Technical requirements / integration contracts**

- `C-DEPLOY-01` (owner `MVP-WEB3-007`, phase MVP): Testnet passphrase, RPC, token ID, contract ID, explorer and tagged ABI.
- `C-ESCROW-01` (owner `MVP-WEB3-001`, phase MVP): Proposed ABI v1: whole-block funding, goal timestamp, CoBusiness release/refund enablement, individual claims and getters.
- `C-EVENT-01` (owner `MVP-WEB3-001`, phase MVP): Escrow event topics/data, unique identity, contract/network and version.

**Dependencies and parallelization**

- `MVP-WEB3-005` (`web3`, BLOCKING / CONTRACT): Implement CoBusiness-authorized payout after operator confirmation. Needed deliverable: C-ESCROW-01, C-EVENT-01. Follow agreed interface; implementation order can overlap after contract review.
- `MVP-WEB3-006` (`web3`, BLOCKING / CONTRACT): Implement CoBusiness refund enablement and individual claims. Needed deliverable: C-ESCROW-01, C-EVENT-01. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: Web/server can use validated network IDs.
- [ ] AC-02: both scripts generate explorer-visible transactions.
- [ ] AC-03: private signing keys never shipped.

**Testing requirements**

Fresh Testnet deployment and success/failure smoke.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F05 Escrow core; source product master sections 4–11.
- Related task IDs: MVP-WEB3-005, MVP-WEB3-006.

### Feature: F10 Demo verification & observability

**Resultado esperado:** Test evidence, admin traceability and reproducible demo.

**Feature acceptance:** Cada tarea hija se prueba; el flujo de usuario y el estado financiero/comercial deben permanecer consistentes después de integrar las tareas dependientes. No se considerará terminada por demos solo con mocks.

#### [MVP-WEB3-008] Verify implemented demo invariants and two prepared routes

**Metadata**

- **Milestone:** MVP
- **Feature:** F10 Demo verification & observability
- **Project Type:** `web3`
- **Priority:** `P0`
- **Work Type:** `test`
- **Estimate:** `5` story points
- **Assignee:** Unassigned
- **Dependencies:** `MVP-WEB3-007`

**Description**

Ajustada a guía demo v1.0; propuesta de implementación, no tarea completada. Alcance detallado a continuación.

**Functional requirements & implementation checklist**

- [ ] FR-01: Verificar aportes = neto pagado + comisión pagada + devuelto + saldo retenido.
- [ ] FR-02: Probar bloques/cupo, permisos, no doble pago y plazos pertinentes a escenarios implementados.
- [ ] FR-03: Verificar TTL suficiente; no exigir auditoría productiva/fuzz exhaustivo para presentación.
- [ ] FR-04: Publicar evidencia Testnet de éxito y UNA devolución; no afirmar pruebas de variantes no implementadas.

**Technical requirements / integration contracts**

- `C-ESCROW-01` (owner `MVP-WEB3-001`, phase MVP): Proposed ABI v1: whole-block funding, goal timestamp, CoBusiness release/refund enablement, individual claims and getters.
- `C-EVENT-01` (owner `MVP-WEB3-001`, phase MVP): Escrow event topics/data, unique identity, contract/network and version.
- `C-DEPLOY-01` (owner `MVP-WEB3-007`, phase MVP): Testnet passphrase, RPC, token ID, contract ID, explorer and tagged ABI.

**Dependencies and parallelization**

- `MVP-WEB3-007` (`web3`, BLOCKING / CONTRACT): Publish Testnet deployment artifacts and executable fixtures. Needed deliverable: C-DEPLOY-01, C-ESCROW-01. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: Éxito incluye ratificación/CoBusiness; devolución habilitación/reclamo.
- [ ] AC-02: No derivar confirmación financiera de mocks ni reloj visual.

**Testing requirements**

Verificar criterios anteriores y controles básicos del flujo implementado; evidencia Testnet cuando corresponde. No exigir excepciones fuera de alcance.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F10 Demo verification & observability; source product master sections 4–11.
- Related task IDs: MVP-WEB3-007.

## Milestone: Fase 2 — Piloto privado B2B y validación comercial

> **FUERA DE DEMO / ROADMAP PROPUESTO:** conservado para trazabilidad, no ratificado ni requisito de presentación.

Importadores con clientes propios; reservas, lotes privados, reportes, notificaciones y validación de ahorro/tiempo; sin recepción de fondos reales hasta requisitos habilitantes.

### Feature: F16 Escrow lifecycle reliability

**Resultado esperado:** Reconciliation and storage lifecycle resilience.

**Feature acceptance:** Cada tarea hija se prueba; el flujo de usuario y el estado financiero/comercial deben permanecer consistentes después de integrar las tareas dependientes. No se considerará terminada por demos solo con mocks.

#### [F2-WEB3-001] Implement on-chain retention/TTL maintenance runbook

**Metadata**

- **Milestone:** Fase 2
- **Feature:** F16 Escrow lifecycle reliability
- **Project Type:** `web3`
- **Priority:** `P1`
- **Work Type:** `infrastructure`
- **Estimate:** `5` story points
- **Assignee:** Unassigned
- **Dependencies:** `MVP-WEB3-008`

**Description**

Ensure pilot escrow states and user refunds survive contract/storage expiry risk.

**Functional requirements & implementation checklist**

- [ ] FR-01: Document TTL for instance/persistent data.
- [ ] FR-02: implement repeatable extend and restore procedures where supported.
- [ ] FR-03: warn operator before expiry and document restore requirements.
- [ ] FR-04: run test cycles.

**Technical requirements / integration contracts**

- `C-ESCROW-01` (owner `MVP-WEB3-001`, phase MVP): Proposed ABI v1: whole-block funding, goal timestamp, CoBusiness release/refund enablement, individual claims and getters.
- `C-DEPLOY-01` (owner `MVP-WEB3-007`, phase MVP): Testnet passphrase, RPC, token ID, contract ID, explorer and tagged ABI.

**Dependencies and parallelization**

- `MVP-WEB3-008` (`web3`, BLOCKING / CONTRACT): Verify implemented demo invariants and two prepared routes. Needed deliverable: C-ESCROW-01, C-EVENT-01. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: Active/failed escrow remains readable and recoverable in documented lifecycle.
- [ ] AC-02: refund path never intentionally expires prematurely.

**Testing requirements**

TTL simulation, storage restoration and recovery smoke.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F16 Escrow lifecycle reliability; source product master sections 4–11.
- Related task IDs: MVP-WEB3-008.

## Milestone: Fase 3 — Protecciones financieras y preparación operativa

> **FUERA DE DEMO / ROADMAP PROPUESTO:** conservado para trazabilidad, no ratificado ni requisito de presentación.

KYC/KYB, legal gate, activos y comisiones, hitos, disputas, conciliación y auditoría. Mainnet únicamente tras autorización legal/operativa y revisión de seguridad.

### Feature: F18 Production financial controls

**Resultado esperado:** Asset/fee policies and production security design.

**Feature acceptance:** Cada tarea hija se prueba; el flujo de usuario y el estado financiero/comercial deben permanecer consistentes después de integrar las tareas dependientes. No se considerará terminada por demos solo con mocks.

#### [F3-WEB3-001] Design production escrow upgrade/migration and formal invariants

**Metadata**

- **Milestone:** Fase 3
- **Feature:** F18 Production financial controls
- **Project Type:** `web3`
- **Priority:** `P0`
- **Work Type:** `security`
- **Estimate:** `8` story points
- **Assignee:** Unassigned
- **Dependencies:** `F3-SERVER-001`, `MVP-WEB3-008`

**Description**

Specify secure evolution from MVP demo escrow to audited production modules.

**Functional requirements & implementation checklist**

- [ ] FR-01: Define new ABI version and migration strategy with no unsafe live-fund upgrade.
- [ ] FR-02: model conserved balances and emergency/timeout policies.
- [ ] FR-03: formalize permissions/segregation and operational limits.
- [ ] FR-04: independent security review issues.

**Technical requirements / integration contracts**

- `C-ESCROW-03` (owner `F3-WEB3-001`, phase Fase 3): Escrow ABI v2 and migration policy for milestones, disputes and partial refunds.
- `C-FINANCE-03` (owner `F3-SERVER-003`, phase Fase 3): Asset allowlist, fee snapshot and ledger event classifications.
- `C-COMPLIANCE-03` (owner `F3-SERVER-001`, phase Fase 3): Production gate, jurisdiction/asset policy, provider decision evidence.

**Dependencies and parallelization**

- `F3-SERVER-001` (`server`, CONTRACT / INTEGRATION): Document regulated-money prerequisites and deployment gates. Needed deliverable: C-COMPLIANCE-03. Start with approved mocks/specifications; integrate and verify before closing.
- `MVP-WEB3-008` (`web3`, BLOCKING / CONTRACT): Verify implemented demo invariants and two prepared routes. Needed deliverable: C-ESCROW-01, C-EVENT-01. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: No unilateral admin drain.
- [ ] AC-02: policy immutable to funded users.
- [ ] AC-03: upgrade/rotation policies require explicit authorization and risk disclosure.
- [ ] AC-INT: producer/consumer contract tests pass with the real counterpart; mock-only passing does not complete cross-repository integration.

**Testing requirements**

Threat model, migration dry run and invariant specification.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F18 Production financial controls; source product master sections 4–11.
- Related task IDs: F3-SERVER-001, MVP-WEB3-008.

### Feature: F19 Milestone payments

**Resultado esperado:** Evidence-backed approvals and staged disbursement.

**Feature acceptance:** Cada tarea hija se prueba; el flujo de usuario y el estado financiero/comercial deben permanecer consistentes después de integrar las tareas dependientes. No se considerará terminada por demos solo con mocks.

#### [F3-WEB3-002] Implement milestone escrow, partial releases and timeout

**Metadata**

- **Milestone:** Fase 3
- **Feature:** F19 Milestone payments
- **Project Type:** `web3`
- **Priority:** `P0`
- **Work Type:** `feature`
- **Estimate:** `8` story points
- **Assignee:** Unassigned
- **Dependencies:** `F3-WEB3-001`

**Description**

Secure staged payouts without permitting refund of already disbursed funds.

**Functional requirements & implementation checklist**

- [ ] FR-01: Define milestone schedule in initialization, authorized approvals and max partial releases.
- [ ] FR-02: enforce paid <= funded, reserved fees and clock boundaries.
- [ ] FR-03: implement hold/dispute lock and timeout/fallback.
- [ ] FR-04: emit event with amount and milestone ID.

**Technical requirements / integration contracts**

- `C-ESCROW-03` (owner `F3-WEB3-001`, phase Fase 3): Escrow ABI v2 and migration policy for milestones, disputes and partial refunds.
- `C-MILESTONE-03` (owner `F3-SERVER-004`, phase Fase 3): Milestone state/evidence/authorized approvers and release preparation.
- `C-EVENT-03` (owner `F3-WEB3-002`, phase Fase 3): Event schemas for staged payouts, holds, resolutions and fees.

**Dependencies and parallelization**

- `F3-WEB3-001` (`web3`, BLOCKING / CONTRACT): Design production escrow upgrade/migration and formal invariants. Needed deliverable: C-ESCROW-03, C-FINANCE-03. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: No approve by unauthorized wallet.
- [ ] AC-02: over-release and release during hold fail.
- [ ] AC-03: remainder consistent.
- [ ] AC-04: funds already released never falsely refundable.

**Testing requirements**

Adversarial milestone/release/refund race and timeout.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F19 Milestone payments; source product master sections 4–11.
- Related task IDs: F3-WEB3-001.

#### [F3-WEB3-003] Implement dispute freeze and authorized resolution allocations

**Metadata**

- **Milestone:** Fase 3
- **Feature:** F19 Milestone payments
- **Project Type:** `web3`
- **Priority:** `P0`
- **Work Type:** `feature`
- **Estimate:** `8` story points
- **Assignee:** Unassigned
- **Dependencies:** `F3-WEB3-002`

**Description**

Enable predetermined arbiter policy for remaining escrow balance.

**Functional requirements & implementation checklist**

- [ ] FR-01: Implement dispute flag and eligible actor auth.
- [ ] FR-02: freeze unsafe releases under applicable policy.
- [ ] FR-03: resolve refund/split to approved parties only.
- [ ] FR-04: validate allocation total, proposal nonce and uniqueness.
- [ ] FR-05: emit dispute/resolution events.

**Technical requirements / integration contracts**

- `C-ESCROW-03` (owner `F3-WEB3-001`, phase Fase 3): Escrow ABI v2 and migration policy for milestones, disputes and partial refunds.
- `C-DISPUTE-03` (owner `F3-SERVER-005`, phase Fase 3): Dispute claims, private evidence, resolution and permitted allocations.
- `C-EVENT-03` (owner `F3-WEB3-002`, phase Fase 3): Event schemas for staged payouts, holds, resolutions and fees.

**Dependencies and parallelization**

- `F3-WEB3-002` (`web3`, BLOCKING / CONTRACT): Implement milestone escrow, partial releases and timeout. Needed deliverable: C-ESCROW-03, C-MILESTONE-03. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: No actor can freeze or transfer outside contract rules.
- [ ] AC-02: resolutions conserve funds.
- [ ] AC-03: replay rejected.
- [ ] AC-04: no clawback of released payment.

**Testing requirements**

Unauthorized freeze, replay and allocation conservation.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F19 Milestone payments; source product master sections 4–11.
- Related task IDs: F3-WEB3-002.

#### [F3-WEB3-004] Audit, fuzz, deploy and publish production contract interfaces

**Metadata**

- **Milestone:** Fase 3
- **Feature:** F19 Milestone payments
- **Project Type:** `web3`
- **Priority:** `P0`
- **Work Type:** `security`
- **Estimate:** `8` story points
- **Assignee:** Unassigned
- **Dependencies:** `F3-WEB3-003`, `F3-SERVER-001`

**Description**

Prepare contract for authorized rollout after independent audit.

**Functional requirements & implementation checklist**

- [ ] FR-01: Add fuzz/property tests and public security review.
- [ ] FR-02: fix findings.
- [ ] FR-03: produce ABI/event docs, tagged wasm hashes and deployment procedure.
- [ ] FR-04: set emergency and TTL runbooks.
- [ ] FR-05: use mainnet only after approval.

**Technical requirements / integration contracts**

- `C-ESCROW-03` (owner `F3-WEB3-001`, phase Fase 3): Escrow ABI v2 and migration policy for milestones, disputes and partial refunds.
- `C-EVENT-03` (owner `F3-WEB3-002`, phase Fase 3): Event schemas for staged payouts, holds, resolutions and fees.
- `C-DEPLOY-03` (owner `F3-WEB3-004`, phase Fase 3): Approved audited ABI/wasm/checksum, network and deployment tags.

**Dependencies and parallelization**

- `F3-WEB3-003` (`web3`, BLOCKING / CONTRACT): Implement dispute freeze and authorized resolution allocations. Needed deliverable: C-ESCROW-03, C-DISPUTE-03. Follow agreed interface; implementation order can overlap after contract review.
- `F3-SERVER-001` (`server`, CONTRACT / INTEGRATION): Document regulated-money prerequisites and deployment gates. Needed deliverable: C-COMPLIANCE-03. Start with approved mocks/specifications; integrate and verify before closing.

**Acceptance criteria**

- [ ] AC-01: Security findings resolved or explicitly blocked.
- [ ] AC-02: immutable artifact checksum.
- [ ] AC-03: approved contract IDs and contract docs shared.
- [ ] AC-04: no implicit mainnet launch.
- [ ] AC-INT: producer/consumer contract tests pass with the real counterpart; mock-only passing does not complete cross-repository integration.

**Testing requirements**

Fuzz, audit finding regression, staging integration.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F19 Milestone payments; source product master sections 4–11.
- Related task IDs: F3-WEB3-003, F3-SERVER-001.

## Milestone: Fase 4 — Bolsa de demanda y marketplace

> **FUERA DE DEMO / ROADMAP PROPUESTO:** conservado para trazabilidad, no ratificado ni requisito de presentación.

Solicitudes de compradores, interés no vinculante, cotizaciones, elección y conversión a una nueva oferta que exige aceptación y pago independientes.

### Feature: F26 Convert demand to funded lot

**Resultado esperado:** Fresh formal agreement and escrow from accepted quote.

**Feature acceptance:** Cada tarea hija se prueba; el flujo de usuario y el estado financiero/comercial deben permanecer consistentes después de integrar las tareas dependientes. No se considerará terminada por demos solo con mocks.

#### [F4-WEB3-001] Validate existing escrow compatibility with demand-originated orders

**Metadata**

- **Milestone:** Fase 4
- **Feature:** F26 Convert demand to funded lot
- **Project Type:** `web3`
- **Priority:** `P1`
- **Work Type:** `test`
- **Estimate:** `3` story points
- **Assignee:** Unassigned
- **Dependencies:** `F4-SERVER-004`, `F3-WEB3-004`

**Description**

Confirm converted offers use the same trusted financial workflow without creating special vote-based escrow.

**Functional requirements & implementation checklist**

- [ ] FR-01: Test conversion-generated lot identifiers and terms hash against escrow ABI.
- [ ] FR-02: enforce no contributions from vote identifiers.
- [ ] FR-03: verify duplicate order refs and source request is off-chain only.
- [ ] FR-04: document whether contract changes are unnecessary.

**Technical requirements / integration contracts**

- `C-CONVERT-04` (owner `F4-SERVER-004`, phase Fase 4): Selected quotation→new lot and explicit buyer opt-in, no auto-pay.
- `C-ESCROW-03` (owner `F3-WEB3-001`, phase Fase 3): Escrow ABI v2 and migration policy for milestones, disputes and partial refunds.
- `C-LOT-01` (owner `MVP-SERVER-005`, phase MVP): Preloaded whole-block lot DTO, frozen terms, token, funding and 24h response deadlines.

**Dependencies and parallelization**

- `F4-SERVER-004` (`server`, CONTRACT / INTEGRATION): Implement accepted quotation to new Collective Order conversion. Needed deliverable: C-CONVERT-04, C-LOT-01. Start with approved mocks/specifications; integrate and verify before closing.
- `F3-WEB3-004` (`web3`, BLOCKING / CONTRACT): Audit, fuzz, deploy and publish production contract interfaces. Needed deliverable: C-ESCROW-03, C-EVENT-03. Follow agreed interface; implementation order can overlap after contract review.

**Acceptance criteria**

- [ ] AC-01: All converted lots fund like original lots.
- [ ] AC-02: requests and votes cannot transfer tokens.
- [ ] AC-03: no unsupported ABI changes.
- [ ] AC-INT: producer/consumer contract tests pass with the real counterpart; mock-only passing does not complete cross-repository integration.

**Testing requirements**

Cross-product Testnet staging E2E; ABI compatibility.

**Definition of Done**

- [ ] Acceptance criteria and negative cases verified in automated tests.
- [ ] Lint/typecheck/build and repository CI pass.
- [ ] Security/authorization, no-sensitive-logs and exact amount constraints reviewed where applicable.
- [ ] Published schema/ABI/fixtures stay version-consistent with other repositories.
- [ ] Pull Request reviewed/merged; docs and environment examples updated.
- [ ] Final integration tested, or issue remains explicitly blocked at integration status.

**References**

- Source domain: F26 Convert demand to funded lot; source product master sections 4–11.
- Related task IDs: F4-SERVER-004, F3-WEB3-004.

## Reglas de cierre del milestone

- **MVP:** Éxito y UNA devolución preparada con transacciones Testnet observables, roles CoBusiness y documentos de ejemplo; no exigir todas las variantes ni afirmar compra/entrega física real.
- **Fase 2:** El operador puede administrar lotes privados y medir reservas vs fondos; métricas del piloto distinguen demos y operaciones observadas.
- **Fase 3:** No se permiten pagos mainnet reales sin revisión legal, auditoría técnica y gate de producción; el saldo nunca se mueve por mera decisión off-chain.
- **Fase 4:** La demanda no vinculante solo se convierte a lote mediante nueva oferta y aceptación explícita; las propuestas compiten con criterios documentados.

## Auditoría de dependencias

- Total tasks in this file: **14**.
- Cada referencia a task ID y contrato es resoluble contra los otros dos archivos.
- Las dependencias se conservan del backlog de origen. SERVER-001 y WEB3-001 acuerdan interfaces en paralelo; su coordinación no exige esperar implementación mutua.
- Los contratos futuros de Fase 3 no se consideran habilitados por haber terminado Testnet MVP.
- Para la demo: CoBusiness autoriza desembolso/habilitación de devolución y comprador reclama. Pendientes delegados: contrato propio por consenso, firma/activo/precio/arquitectura y tasa ilustrativa. Para una etapa futura: costeo comercial, KYC/KYB reales, rampas y jurisdicción; no bloquean presentación.
