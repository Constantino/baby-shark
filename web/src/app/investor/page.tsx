import { ConnectWallet } from "@/components/ConnectWallet";

export default function InvestorPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Investor Dashboard
        </h1>
        <ConnectWallet />
      </div>
    </div>
  );
}
