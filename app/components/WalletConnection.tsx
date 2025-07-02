"use client";

import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletAdvancedAddressDetails,
  WalletAdvancedTokenHoldings,
  WalletAdvancedTransactionActions,
  WalletAdvancedWalletActions,
} from "@coinbase/onchainkit/wallet";
import Subscribe from "./Subscribe";

export function WalletConnection() {
  return (
    <div className="flex justify-center">
      <Wallet>
        <ConnectWallet className="px-6 py-3 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl shadow-2xl border-0 transform hover:scale-105 transition-all duration-300">
          Connect Wallet
        </ConnectWallet>
        <div className="mb-4 p-4 right-0 max-w-[30vw]   rounded-xl ">
          <Subscribe />
        </div>
        <WalletDropdown className="bg-slate-800/95 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl">
          <WalletAdvancedAddressDetails />
          <WalletAdvancedTokenHoldings />
          <WalletAdvancedTransactionActions />
          <WalletAdvancedWalletActions />
        </WalletDropdown>
      </Wallet>
    </div>
  );
}
