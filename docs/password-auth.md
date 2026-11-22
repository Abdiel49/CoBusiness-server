# Email and password authentication

Configure `CLIENT_ORIGIN` to the web application URL; its origin is required for state-changing requests. Apply migrations with `npm run migration:run`. HTTPS is required for Secure session cookies (localhost browsers may permit them).

`POST /api/v1/auth/register` and `POST /api/v1/auth/login` accept `email` and `password`; passwords must have 12–128 characters. Login sets a secure HttpOnly session cookie. `POST /api/v1/auth/logout` revokes that session. Send the configured Origin header and include cookies on requests. New accounts have the buyer role, controlled by the server.

Email ownership verification and password recovery are not available. Existing Google-only accounts have no password and cannot log in until a future account recovery process exists. If existing Google accounts have duplicate normalized email addresses, resolve them before applying the password migration.
