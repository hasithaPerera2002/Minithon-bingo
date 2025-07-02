"use client";

import { use, useEffect, useState } from "react";
import { useWriteContract, useReadContract, Config, useAccount } from "wagmi";
import BingoABI from "../../abi/Bingo.json";
import toast from "react-hot-toast";
import React from "react";
import { Address } from "@coinbase/onchainkit/identity";

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
  const { writeContract } = useWriteContract();
  const [grid, setGrid] = useState<BingoGrid>([]);
  const { isConnected, address } = useAccount();
  const [isMember, setIsMember] = useState<boolean>(false);

  // Read contract data
  const {
    data: userGrid,
    refetch: refetchUserGrid,
    error: errorLoadingUserGrid,
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
    error: errorLoadingIsMember,
    isSuccess: isIsMemberLoaded,
    isError: isMemberError,
    refetch: refetchIsMember,
  } = useReadContract({
    address: BINGO_CONTRACT_ADDRESS,
    abi: BingoABI.abi,
    functionName: "checkMemberExists",
    args: [address],
  });

  const { data: MemberList } = useReadContract({
    address: BINGO_CONTRACT_ADDRESS,
    abi: BingoABI.abi,
    functionName: "getMemberList",
  });

  const {
    data: bingoBoard,
    isFetched: isBingoBoardFetched,
    isLoading: isBingoBoardLoading,
    isError: isBingoBoardError,
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

  const markSquareOnContract = async (index: number) => {
    console.log("Marking square on contract:", index);
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
      console.log("User Grid:", userGrid);
      
      if (bingoBoard?.items) {
        const rowLength = 5;
        for (let i = 0; i < bingoBoard.items.length; i += rowLength) {
          const row: BingoSquare[] = bingoBoard.items
            .slice(i, i + rowLength)
            .map((item, idx) => {
              console.log("Mapping item:", idx+i, "User Grid:", userGrid[i+idx]);
              return {
                text: item.data,
                marked: userGrid[i+idx],
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
    console.log("Checking connection status:", isMemberRes, isMember);
    console.log("Member List:", MemberList);
    if (typeof isMemberRes === "boolean") {
      if (isMemberRes) {
        setIsMember(true);
      } else {
        showToast();
      }
    }
  }, [isMemberRes]);
  
  useEffect(() => {
    if (isConnected) {
      getFormattedGrid();
    } else {
      setGrid([]);
    }
  }, [userGrid]);
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
  };
}
