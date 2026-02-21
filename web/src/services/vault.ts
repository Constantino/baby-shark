import { BrowserProvider, Contract, parseUnits } from "ethers";

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS!;
const ASSET_ADDRESS = process.env.NEXT_PUBLIC_ASSET_ADDRESS!;

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
];

const VAULT_ABI = [
  "function deposit(uint256 assets, address receiver) returns (uint256 shares)",
];

export async function depositToVault(amountHuman: string): Promise<string> {
  if (!window.ethereum) throw new Error("No wallet found");

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const receiver = await signer.getAddress();

  const asset = new Contract(ASSET_ADDRESS, ERC20_ABI, signer);
  const decimals: number = await asset.decimals();
  const amount = parseUnits(amountHuman, decimals);

  const approveTx = await asset.approve(VAULT_ADDRESS, amount);
  await approveTx.wait();

  const vault = new Contract(VAULT_ADDRESS, VAULT_ABI, signer);
  const depositTx = await vault.deposit(amount, receiver);
  const receipt = await depositTx.wait();

  return receipt.hash;
}
