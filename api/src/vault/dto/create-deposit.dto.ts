export class CreateDepositDto {
  vault_address: string;
  wallet_address: string;
  amount_deposited: string; // string to safely handle uint256
  tx_hash: string;
}
