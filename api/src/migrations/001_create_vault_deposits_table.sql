CREATE TABLE IF NOT EXISTS vault_deposits (
    id SERIAL PRIMARY KEY,
    vault_address VARCHAR(42) NOT NULL,
    wallet_address VARCHAR(42) NOT NULL,
    amount_deposited NUMERIC(78, 0) NOT NULL,
    tx_hash VARCHAR(66) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
