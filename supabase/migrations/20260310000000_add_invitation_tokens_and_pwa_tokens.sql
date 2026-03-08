-- Add one-click auth tokens to invitations
ALTER TABLE invitations
  ADD COLUMN token uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days');

CREATE UNIQUE INDEX invitations_token_idx ON invitations (token);

-- Add PWA launch tokens to users for session bootstrapping
ALTER TABLE users
  ADD COLUMN pwa_token uuid,
  ADD COLUMN pwa_token_expires_at timestamptz;

CREATE UNIQUE INDEX users_pwa_token_idx ON users (pwa_token) WHERE pwa_token IS NOT NULL;
