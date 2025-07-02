
"use client";

import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletAdvancedAddressDetails,
  WalletAdvancedTokenHoldings,
  WalletAdvancedTransactionActions,
  WalletAdvancedWalletActions,
} from '@coinbase/onchainkit/wallet';

export function WalletConnection() {
  return (
    <div className="flex justify-center">
      <Wallet>
        <ConnectWallet className="px-6 py-3 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl shadow-2xl border-0 transform hover:scale-105 transition-all duration-300">
          <span>Connect Wallet</span>
        </ConnectWallet>
        <WalletDropdown className="bg-slate-800/95 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl">
          <WalletAdvancedAddressDetails/>
          <WalletAdvancedTokenHoldings/>
          <WalletAdvancedTransactionActions/>
          <WalletAdvancedWalletActions/>
        </WalletDropdown>
      </Wallet>
    </div>
  );
}
