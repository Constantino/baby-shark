import { type WalletClient, parseUnits, getContract } from "viem";
import { baseSepolia } from "wagmi/chains";

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS! as `0x${string}`;
const ASSET_ADDRESS = process.env.NEXT_PUBLIC_ASSET_ADDRESS! as `0x${string}`;
const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;

const VAULT_ABI = [
  {
    name: "deposit",
    type: "function",
    inputs: [
      { name: "assets", type: "uint256" },
      { name: "receiver", type: "address" },
    ],
    outputs: [{ name: "shares", type: "uint256" }],
    stateMutability: "nonpayable",
  },
] as const;

export async function depositToVault(
  walletClient: WalletClient,
  amountHuman: string
): Promise<string> {
  const [receiver] = await walletClient.getAddresses();
  const amount = parseUnits(amountHuman, 6); // USDC = 6 decimals

  // Step 1: approve
  const approveTxHash = await walletClient.writeContract({
    address: ASSET_ADDRESS,
    abi: ERC20_ABI,
    functionName: "approve",
    args: [VAULT_ADDRESS, amount],
    chain: baseSepolia,
    account: receiver,
  });

  // Step 2: deposit
  const depositTxHash = await walletClient.writeContract({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    functionName: "deposit",
    args: [amount, receiver],
    chain: baseSepolia,
    account: receiver,
  });

  // Step 3: register deposit in backend
  await registerDeposit(receiver, amount, depositTxHash);

  return depositTxHash;
}

async function registerDeposit(
  walletAddress: string,
  amountWei: bigint,
  txHash: string
): Promise<void> {
  await fetch(`${API_URL}/vault/deposit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      vault_address: VAULT_ADDRESS,
      wallet_address: walletAddress,
      amount_deposited: amountWei.toString(),
      tx_hash: txHash,
    }),
  });
}
