import { NextRequest, NextResponse } from "next/server";
import { getPublicClient, getSpenderWalletClient } from "../../../lib/spender";
import {
  spendPermissionManagerAbi,
  spendPermissionManagerAddress,
} from "../../../lib/abi/SpendPermissionManager";

export async function POST(request: NextRequest) {
  const spenderBundlerClient = await getSpenderWalletClient();
  const publicClient = await getPublicClient();
  try {
    const body = await request.json();
    const { spendPermission, signature } = body;
    console.log("Received spendPermission:", spendPermission);
    console.log("Received signature:", signature);

    const approvalTxnHash = await spenderBundlerClient.writeContract({
      address: spendPermissionManagerAddress,
      abi: spendPermissionManagerAbi,
      functionName: "approveWithSignature",
      args: [spendPermission, signature],
    });

     await publicClient.waitForTransactionReceipt({
      hash: approvalTxnHash,
    });

    const spendTxnHash = await spenderBundlerClient.writeContract({
      address: spendPermissionManagerAddress,
      abi: spendPermissionManagerAbi,
      functionName: "spend",
      args: [spendPermission, "1"],
    });

    const spendReceipt = await publicClient.waitForTransactionReceipt({
      hash: spendTxnHash,
    });

    return NextResponse.json({
      status: spendReceipt.status ? "success" : "failure",
      transactionHash: spendReceipt.transactionHash,
      transactionUrl: `https://sepolia.basescan.org/tx/${spendReceipt.transactionHash}`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({}, { status: 500 });
  }
}
