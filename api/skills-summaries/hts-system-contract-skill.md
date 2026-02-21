<!-- content-hash:06905400653eb140 -->
# Hedera Token Service (HTS) System Contract

HTS precompile: `0x167`

## Imports

```solidity
import {HederaTokenService} from "@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/HederaTokenService.sol";
import {KeyHelper} from "@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/KeyHelper.sol";
import {ExpiryHelper} from "@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/ExpiryHelper.sol";
import {HederaResponseCodes} from "@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/HederaResponseCodes.sol";
```

**Safe variants**: `SafeHTS.sol`, `SafeViewHTS.sol` (auto-revert on failure)

## HBAR Payment Required

Token creation requires explicit HBAR value:

```solidity
(int rc, address token) = createNonFungibleToken{value: msg.value}(token);
```

```typescript
await contract.createToken(name, symbol, {
  gasLimit: 350_000,
  value: ethers.parseEther("15"),
});
```

## Token Key Types

| Key    | Bit | Value | Controls                     |
|--------|-----|-------|------------------------------|
| ADMIN  | 0   | 1     | Update token, keys, deletion |
| KYC    | 1   | 2     | Grant/revoke KYC             |
| FREEZE | 2   | 4     | Freeze/unfreeze accounts     |
| WIPE   | 3   | 8     | Wipe balances                |
| SUPPLY | 4   | 16    | Mint/burn                    |
| FEE    | 5   | 32    | Update fees                  |
| PAUSE  | 6   | 64    | Pause all operations         |

```solidity
keys[0] = getSingleKey(KeyType.SUPPLY, KeyValueType.CONTRACT_ID, address(this));
```

## Association

```solidity
int rc = associateToken(accountAddress, tokenAddress);
require(
    rc == HederaResponseCodes.SUCCESS ||
    rc == HederaResponseCodes.TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT,
    "Association failed"
);
```

## Fungible Token Creation

```solidity
function createToken() external payable {
    IHederaTokenService.HederaToken memory token;
    token.name = "My Token";
    token.symbol = "MTK";
    token.treasury = address(this);
    token.expiry = createAutoRenewExpiry(address(this), 7776000);

    (int rc, address created) = createFungibleToken{value: msg.value}(
        token, 1000000, 18
    );
    require(rc == HederaResponseCodes.SUCCESS, "Create failed");
}
```

## NFT Collection + Mint

```solidity
function createNFT() external payable {
    IHederaTokenService.HederaToken memory token;
    token.name = "My NFT";
    token.symbol = "MNFT";
    token.treasury = address(this);
    token.tokenSupplyType = true;  // FINITE
    token.maxSupply = 10000;

    IHederaTokenService.TokenKey[] memory keys = new IHederaTokenService.TokenKey[](1);
    keys[0] = getSingleKey(KeyType.SUPPLY, KeyValueType.CONTRACT_ID, address(this));
    token.tokenKeys = keys;
    token.expiry = createAutoRenewExpiry(address(this), 7776000);

    (int rc, address created) = createNonFungibleToken{value: msg.value}(token);
    require(rc == HederaResponseCodes.SUCCESS, "Create failed");
}

function mintNFT(bytes memory metadata) external {
    bytes[] memory metas = new bytes[](1);
    metas[0] = metadata;
    (int rc, , int64[] memory serials) = mintToken(tokenAddress, 0, metas);
    require(rc == HederaResponseCodes.SUCCESS, "Mint failed");
}
```

## KYC Self-Grant

```solidity
int kycRc = grantTokenKyc(tokenAddress, address(this));
require(kycRc == HederaResponseCodes.SUCCESS, "Self-KYC failed");
```

## Response Codes

`SUCCESS = 22`. Always check return codes:

```solidity
require(responseCode == HederaResponseCodes.SUCCESS, "Operation failed");
```

## References

- API signatures: `references/api.md`
- Custom fees: `references/fees.md`
- KYC/freeze/pause: `references/compliance.md`
- Struct definitions: `references/structs.md`
- Key value types: `references/keys.md`
- Error codes: `references/response-codes.md`