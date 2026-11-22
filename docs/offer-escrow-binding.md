# Register a Testnet offer

Apply migrations before registration (`npm run migration:run`). Set `STELLAR_RPC_URL`, `STELLAR_NETWORK_PASSPHRASE` to the Testnet passphrase, and `STELLAR_ENABLED=true` for payment preparation. Build with `npm run build`. Register an already deployed escrow-v2 contract using `node dist/admin/register-offer-escrow.js /path/to/binding.json`.

The JSON contains `offerId`, `contractId`, and `terms` with `chainLotId` (32-byte lowercase hex), `authority`, `operator`, `asset`, `unitsPerBlock`, `totalBlocks`, `blockPriceMinor` (decimal string), and `fundingDeadline` (Unix seconds as a decimal string). No private keys are needed. The administrative process verifies the actual Testnet network, deployed instance, WASM, asset, all contract configuration and canonical XDR hash before inserting an immutable binding. The demo lot ID is reserved and cannot be used. A contract can be bound once; corrections require a new offer and contract.

The registered offer appears in `GET /api/v1/lots` and `GET /api/v1/lots/:id`; orders use its canonical terms hash. Preparation verifies the deployment again, failing closed on any RPC error or mismatch. Funding remains subject to order, payment, wallet, and on-chain requirements; registration is not proof of funding. Do not register the existing historical evidence contracts as new offers.
