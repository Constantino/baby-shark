"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { VaultDeposit } from "@/components/VaultDeposit";

export default function InvestorPage() {
  return (
    <div className="flex flex-col items-center gap-6 pt-10">
      <ConnectButton chainStatus="full" />
      <VaultDeposit />
    </div>
  );
}
