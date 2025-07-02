"use client";

import { type ReactNode } from "react";
import { baseSepolia } from "wagmi/chains";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  WagmiProvider,
  cookieStorage,
  createConfig,
  createStorage,
  http,
} from "wagmi";
import { coinbaseWallet } from "wagmi/connectors";
export function Providers(props: { children: ReactNode }) {
  const config = createConfig({
    chains: [baseSepolia],
    transports: {
      [baseSepolia.id]: http(),
    },
    connectors: [
      coinbaseWallet({
        appName: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
        preference: process.env.NEXT_PUBLIC_ONCHAINKIT_WALLET_CONFIG as
          | "smartWalletOnly"
          | "all",
        // @ts-expect-error because wagmi types are not updated yet
        keysUrl: "https://keys-dev.coinbase.com/connect",
      }),
    ],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
  });
  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <MiniKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={baseSepolia}
          config={{
            appearance: {
              mode: "auto",
              theme: "mini-app-theme",
              name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
              logo: process.env.NEXT_PUBLIC_ICON_URL,
            },
          }}
        >
          {props.children}
        </MiniKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
