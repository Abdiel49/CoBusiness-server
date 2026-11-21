# Testnet wallet binding

Authenticate using the session cookie. Send the configured `CLIENT_ORIGIN` as Origin on state-changing requests.

`POST /api/v1/wallet/challenge` returns a five-minute challenge and its exact `message`. Sign that message using SEP-53 and send the canonical base64 signature, G-address, `challengeId`, and returned Testnet `network` to `POST /api/v1/wallet/verify`. Challenges are single-use and wallet addresses have one active owner. `DELETE /api/v1/wallet` revokes the current binding. `GET /api/v1/me` reads the current binding from PostgreSQL.

The automated PostgreSQL integration test uses independently pooled connections and a Stellar SDK-generated signing key. The Stellar CLI installed here has no message-signing command, and no browser wallet was selected for the MVP; browser wallet interoperability therefore still requires verification with a wallet implementing SEP-53.
