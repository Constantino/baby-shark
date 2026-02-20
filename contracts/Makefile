.PHONY: deploy build test clean generate-abi

include .env
export

build:
	forge build

test:
	forge test

deploy:
	@echo "Deploying Vault contract..."
	@forge script script/DeployVault.s.sol:DeployVault \
		--rpc-url $(RPC_URL) \
		--broadcast \
		--verify \
		--etherscan-api-key $(ETHERSCAN_API_KEY) \
		--legacy \
		2>&1 | tee deploy.log
	@echo ""
	@echo "Updating .env file..."
	@VAULT_ADDRESS=$$(grep "Vault Address:" deploy.log | tail -1 | awk '{print $$3}'); \
	if [ -n "$$VAULT_ADDRESS" ]; then \
		if grep -q "VAULT_ADDRESS=" .env; then \
			grep -v "VAULT_ADDRESS=" .env > .env.tmp && \
			echo "VAULT_ADDRESS=$$VAULT_ADDRESS" >> .env.tmp && \
			mv .env.tmp .env; \
		else \
			echo "VAULT_ADDRESS=$$VAULT_ADDRESS" >> .env; \
		fi; \
		echo "✓ Updated .env with vault address: $$VAULT_ADDRESS"; \
		echo ""; \
		echo "==========================================";\
		echo "Deployed Contract:"; \
		echo "==========================================";\
		echo ""; \
		echo "Vault:"; \
		echo "  Address: $$VAULT_ADDRESS"; \
		echo "  Explorer: $(EXPLORER_URL)/address/$$VAULT_ADDRESS"; \
		echo ""; \
	fi
	@rm -f deploy.log

generate-abi:
	@echo "Building contracts..."
	@forge build
	@echo "Generating ABI for Vault..."
	@if [ -f "out/Vault.sol/Vault.json" ]; then \
		echo "export const VAULT_ABI = $$(jq -c .abi "out/Vault.sol/Vault.json") as const;" > "abi/Vault.ts"; \
		echo "✓ ABI file generated in abi/Vault.ts"; \
	else \
		echo "✗ Error: Vault.json not found"; \
	fi

clean:
	forge clean
