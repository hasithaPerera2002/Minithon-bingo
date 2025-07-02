"use client";
import { cn, color, pressable, text } from "@coinbase/onchainkit/theme";
import { useEffect, useState } from "react";
import {
  useAccount,
  useChainId,
  useConnect,
  useConnectors,
  useSignTypedData,
} from "wagmi";
import { Address, Hex, parseUnits } from "viem";
import { useQuery } from "@tanstack/react-query";
import { spendPermissionManagerAddress } from "@/lib/abi/SpendPermissionManager";

export default function Subscribe() {
  const [isDisabled, setIsDisabled] = useState(false);
  const [signature, setSignature] = useState<Hex>();
  const [transactions, setTransactions] = useState<Hex[]>([]);
  const [spendPermission, setSpendPermission] = useState<object>();

  const { signTypedDataAsync } = useSignTypedData();
  const account = useAccount();
  const chainId = useChainId();
  const { connectAsync } = useConnect();
  const connectors = useConnectors();

  const { data, refetch } = useQuery({
    queryKey: ["collectSubscription"],
    queryFn: handleCollectSubscription,
    refetchOnWindowFocus: false,
    enabled: !!signature,
  });

  async function handleSubmit() {
    setIsDisabled(true);
    let accountAddress = account?.address;
    if (!accountAddress) {
      try {
        const requestAccounts = await connectAsync({
          connector: connectors[0],
        });
        accountAddress = requestAccounts.accounts[0];
      } catch {
        return;
      }
    }

    const spendPermission = {
      account: accountAddress, // User wallet address
      spender: process.env.NEXT_PUBLIC_SPENDER_ADDRESS! as Address, // Spender smart contract wallet address
      token: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" as Address, // ETH (https://eips.ethereum.org/EIPS/eip-7528)
      allowance: parseUnits("0.1", 18),
      period: 86400, // seconds in a day
      start: 0, // unix timestamp
      end: 281474976710655, // max uint48
      salt: BigInt(0),
      extraData: "0x" as Hex,
    };

    try {
      console.log("chainId", chainId);
      
      const signature = await signTypedDataAsync({
        domain: {
          name: "Spend Permission Manager",
          version: "1",
          chainId: chainId,
          verifyingContract: spendPermissionManagerAddress,
        },
        types: {
          SpendPermission: [
            { name: "account", type: "address" },
            { name: "spender", type: "address" },
            { name: "token", type: "address" },
            { name: "allowance", type: "uint160" },
            { name: "period", type: "uint48" },
            { name: "start", type: "uint48" },
            { name: "end", type: "uint48" },
            { name: "salt", type: "uint256" },
            { name: "extraData", type: "bytes" },
          ],
        },
        primaryType: "SpendPermission",
        message: spendPermission,
      });
      setSpendPermission(spendPermission);
      setSignature(signature);
    } catch (e) {
      console.error(e);
    }
    setIsDisabled(false);
  }

  async function handleCollectSubscription() {
    setIsDisabled(true);
    console.log('spendPermission', spendPermission);
    
    let data;
    try {
      //@ts-nocheck
      const replacer = (key: string, value: unknown): unknown => {
        if (typeof value === "bigint") {
          return value.toString();
        }
        return value;
      };
      const response = await fetch("/api/collect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          {
            spendPermission,
            signature,
            dummyData: Math.ceil(Math.random() * 100),
          },
          replacer,
        ),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      data = await response.json();
    } catch (e) {
      console.error(e);
    }
    setIsDisabled(false);
    return data;
  }

  useEffect(() => {
    if (!data) return;
    setTransactions([data?.transactionHash, ...transactions]);
  }, [data]);

  return (
    <div>
      {!signature ? (
        <div className="flex w-[150px]">
          <button
            className={cn(
              pressable.primary,
              "w-full rounded-xl",
              "px-4 py-3 font-medium text-base text-white leading-6",
              isDisabled && pressable.disabled,
              text.headline,
            )}
            onClick={handleSubmit}
            type="button"
            disabled={isDisabled}
            data-testid="ockTransactionButton_Button"
          >
            <span
              className={cn(
                text.headline,
                color.inverse,
                "flex justify-center text-xs",
              )}
            >
              Subscribe For Spend Permission
            </span>
          </button>
        </div>
      ) : (
        <div className="space-y-8 w-[450px]">
          <div className="flex">
            <button
              className={cn(
                pressable.primary,
                "w-full rounded-xl",
                "px-4 py-3 font-medium text-base text-white leading-6",
                isDisabled && pressable.disabled,
                text.headline,
              )}
              onClick={() => refetch()}
              type="button"
              disabled={isDisabled}
              data-testid="collectSubscriptionButton_Button"
            >
              <span
                className={cn(
                  text.headline,
                  color.inverse,
                  "flex justify-center",
                )}
              >
                Collect Subscription
              </span>
            </button>
          </div>
          <div className="h-80 space-y-4 relative">
            <div className="text-lg font-bold">Subscription Payments</div>
            <div className="flex flex-col">
              {transactions.map((transactionHash, i) => (
                <a
                  key={i}
                  className="hover:underline text-ellipsis truncate"
                  target="_blank"
                  href={`https://sepolia.basescan.org/tx/${transactionHash}`}
                >
                  View transaction {transactionHash}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
