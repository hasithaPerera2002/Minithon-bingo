"use client";

import { useEffect, useState } from "react";
import { useWriteContract, useReadContract, Config, useAccount } from "wagmi";
import BingoABI from "../../../lib/abi/Bingo.json";
import toast from "react-hot-toast";
import React from "react";

type BingoSquare = {
  text: string;
  marked: boolean;
  id: string;
};

interface BingoItem {
  data: string;
  completed: boolean;
}
interface BingoBoard {
  items: BingoItem[];
  stage1_url: string;
  stage2_url: string;
  stage3_url: string;
  stage4_url: string;
  completed_url: string;
}

type BingoGrid = BingoSquare[][];

const BINGO_CONTRACT_ADDRESS = "0x074b84E49D806fD9912B1AAa1c8FdEe35c15404a";
export function useSmartContract() {
  const { writeContract, status } = useWriteContract({
    mutation: {
      onSuccess: (data) => {
        refetchUserGrid();
        getFormattedGrid();
        console.log("Transaction successful:", data);
      },
      onError: (error) => {
        console.error("Transaction failed:", error);
        toast.error("Transaction failed. Please try again.");
      },
    },
  });
  const [grid, setGrid] = useState<BingoGrid>([]);
  const { isConnected, address } = useAccount();
  const [isMember, setIsMember] = useState<boolean>(false);
  const [nftUrl, setNftUrl] = useState<string>("");

  // Read contract data
  const {
    data: userGrid,
    refetch: refetchUserGrid,
    isError: isUserGridError,
    isSuccess: isUserGridLoaded,
  } = useReadContract<
    typeof BingoABI.abi,
    "getUserBingoBoard",
    [number],
    Config,
    boolean[]
  >({
    address: BINGO_CONTRACT_ADDRESS,
    abi: BingoABI.abi,
    functionName: "getUserBingoBoard",
    args: [0],
    account: address,
  });

  const {
    data: isMemberRes,
    isError: isMemberError,
  } = useReadContract({
    address: BINGO_CONTRACT_ADDRESS,
    abi: BingoABI.abi,
    functionName: "checkMemberExists",
    args: [address],
  });

  

  const {
    data: bingoBoard,
    isFetched: isBingoBoardFetched,
    isLoading: isBingoBoardLoading,
    refetch: refetchBingoBoard,
  } = useReadContract<
    typeof BingoABI.abi, // ← the ABI type, not the value
    "getBingoBoard", // ← the exact view fn name
    [number], // ← your args tuple: [boardIndex]
    Config, // ← Wagmi’s config generic (can be left as unknown)
    BingoBoard
  >({
    address: BINGO_CONTRACT_ADDRESS,
    abi: BingoABI.abi,
    functionName: "getBingoBoard",
    args: [0],
  });

  const {
    data: nftData,
    isSuccess: isNftLoaded,
  } = useReadContract<
    typeof BingoABI.abi, // ← the ABI type, not the value
    "getUserTokenURI", // ← the exact view fn name
    [number], // ← your args tuple: [boardIndex]
    Config, // ← Wagmi’s config generic (can be left as unknown)
    string
  >({
    address: BINGO_CONTRACT_ADDRESS,
    abi: BingoABI.abi,
    functionName: "getUserTokenURI",
    args: [0], 
    account: address,
  });

  const markSquareOnContract = async (index: number) => {
    try {
      if (!isMember) {
        console.error("User is not a member, cannot mark square.");
        toast.error(
          "You are not a member. Please join the bingo game to play!",
        );
        showToast();
        return;
      }
      writeContract({
        address: BINGO_CONTRACT_ADDRESS,
        abi: BingoABI.abi,
        functionName: "markItemCompleted",
        args: [0, index], // userBoardIndex = 0
      });
      getFormattedGrid();
    } catch (error) {
      console.error("Error marking square on contract:", error);
      throw error;
    }
  };

  const getFormattedGrid = () => {
    if (!userGrid) {
      refetchUserGrid();
      const formattedGrid: BingoGrid = [];
      if (bingoBoard?.items) {
        const rowLength = 5;
        for (let i = 0; i < bingoBoard.items.length; i += rowLength) {
          const row: BingoSquare[] = bingoBoard.items
            .slice(i, i + rowLength)
            .map((item, idx) => ({
              text: item.data,
              marked: item.completed,
              id: (i + idx).toString(),
            }));
          formattedGrid.push(row);
        }
      }
      setGrid(formattedGrid);
    } else {
      const formattedGrid: BingoGrid = [];
      console.log("userGrid:", userGrid);

      if (bingoBoard?.items) {
        const rowLength = 5;
        for (let i = 0; i < bingoBoard.items.length; i += rowLength) {
          const row: BingoSquare[] = bingoBoard.items
            .slice(i, i + rowLength)
            .map((item, idx) => {
              return {
                text: item.data,
                marked: userGrid[i + idx],
                id: (i + idx).toString(),
              };
            });
          formattedGrid.push(row);
        }
      }
      setGrid(formattedGrid);
    }
  };
  useEffect(() => {
    if (typeof isMemberRes === "boolean") {
      if (isMemberRes) {
        setIsMember(true);
      } else {
        showToast();
      }
    }
  }, [isMemberRes]);

  useEffect(() => {
    //@ts-ignore
    nftData
    if (isConnected) {
      getFormattedGrid();
    } else {
      setGrid([]);
    }
    if (isNftLoaded) {
      console.log("NFT Data:", nftData);
      setNftUrl(nftData);
    } else {
      setNftUrl("");
    }
  }, [userGrid, isUserGridLoaded, status,isNftLoaded]);
  const showToast = () =>
    toast.custom(
      (t) =>
        React.createElement(
          "div",
          {
            style: {
              padding: "12px 24px",
              background: "#fff",
              color: "black",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            },
          },

          React.createElement(
            "span",
            null,
            "You are not a member . Please join the bingo game to play!",
          ),
          React.createElement(
            "button",
            {
              onClick: async () => {
                try {
                  writeContract({
                    address: BINGO_CONTRACT_ADDRESS,
                    abi: BingoABI.abi,
                    functionName: "addUser",
                    args: [],
                  });
                  setIsMember(true);
                } catch (err) {
                  console.error(err);
                } finally {
                  toast.dismiss(t.id);
                }
              },
              style: {
                marginLeft: "auto",
                background: "#4ade80",
                color: "#000",
                border: "none",
                padding: "6px 22px",
                borderRadius: "4px",
                cursor: "pointer",
              },
            },
            "OK",
          ),
          React.createElement(
            "button",
            {
              onClick: () => {
                toast.dismiss(t.id);
              },
              style: {
                marginLeft: "auto",
                background: "#4ade80",
                color: "#000",
                border: "none",
                padding: "6px 12px",
                borderRadius: "4px",
                cursor: "pointer",
              },
            },
            "CLOSE",
          ),
        ),
      {
        duration: 8000,
      },
    );

  return {
    markSquareOnContract,
    isBingoBoardLoading,
    isBingoBoardFetched,
    refetchUserGrid,
    refetchBingoBoard,
    grid,
    setGrid,
    getFormattedGrid,
    isMemberError,
    isUserGridError,
    nftUrl,
  };
}
