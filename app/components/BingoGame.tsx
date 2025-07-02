"use client";

import { useState, useEffect, useCallback } from "react";
import { WalletConnection } from "./WalletConnection";
import { useSmartContract } from "../components/hooks/useSmartContract";
import { useAccount } from "wagmi";
type BingoSquare = {
  text: string;
  marked: boolean;
  id: string;
};

type BingoGrid = BingoSquare[][];

export function BingoGame() {
  const [completedRows, setCompletedRows] = useState<number[]>([]);
  const [completedCols, setCompletedCols] = useState<number[]>([]);
  const [completedDiagonals, setCompletedDiagonals] = useState<string[]>([]);
  const [isBingo, setIsBingo] = useState(false);
  const [animatingElements, setAnimatingElements] = useState<string[]>([]);
  const [pulsingSquares, setPulsingSquares] = useState<string[]>([]);
  
  const { address, isConnected } = useAccount();
  const {
    markSquareOnContract,
    isBingoBoardLoading,
    grid,
    setGrid,
    getFormattedGrid,
    isMemberError,
    nftUrl
  } = useSmartContract();

  // Load grid from smart contract when wallet connects
  useEffect(() => {
    if (isConnected && address) {
    }
  }, [address]);

  useEffect(() => {
    getFormattedGrid();
    checkForWins(grid);
  }, [isBingoBoardLoading]);

  useEffect( () => {
    // Check for wins whenever the grid changes
    if (grid && grid.length > 0) {
      checkForWins(grid);
    } else {
      console.warn("Grid is empty or not initialized");
    }

   
  
   
  }, [grid])
  

  const checkForWins = useCallback((currentGrid: BingoGrid) => {
    console.log("Checking for wins...",currentGrid);

    if (!currentGrid || currentGrid.length === 0) {
      console.warn("Grid is empty or not initialized");
      return;
    }


    const newCompletedRows: number[] = [];
    const newCompletedCols: number[] = [];
    const newCompletedDiagonals: string[] = [];

    // Check rows
    for (let row = 0; row < 5; row++) {
      if (currentGrid[row].every((square) => square.marked)) {
        newCompletedRows.push(row);
      }
    }

    // Check columns
    for (let col = 0; col < 5; col++) {
      if (currentGrid.every((row) => row[col].marked)) {
        newCompletedCols.push(col);
      }
    }

    // Check diagonals
    if (currentGrid.every((row, index) => row[index].marked)) {
      newCompletedDiagonals.push("main");
    }
    if (currentGrid.every((row, index) => row[4 - index].marked)) {
      newCompletedDiagonals.push("anti");
    }

    // Check for bingo (5 lines completed)
    const totalLines =
      newCompletedRows.length +
      newCompletedCols.length +
      newCompletedDiagonals.length;
    const newIsBingo = totalLines >= 5;

    // Update states and trigger animations
    setCompletedRows(newCompletedRows);
    setCompletedCols(newCompletedCols);
    setCompletedDiagonals(newCompletedDiagonals);
    setIsBingo(newIsBingo);

    // Trigger animations for new completions
    const newAnimations: string[] = [];
    const newPulsingSquares: string[] = [];

    newCompletedRows.forEach((row) => {
      newAnimations.push(`row-${row}`);
      for (let col = 0; col < 5; col++) {
        newPulsingSquares.push(`${row}-${col}`);
      }
    });

    newCompletedCols.forEach((col) => {
      newAnimations.push(`col-${col}`);
      for (let row = 0; row < 5; row++) {
        newPulsingSquares.push(`${row}-${col}`);
      }
    });

    newCompletedDiagonals.forEach((diag) => {
      newAnimations.push(`diag-${diag}`);
      if (diag === "main") {
        for (let i = 0; i < 5; i++) {
          newPulsingSquares.push(`${i}-${i}`);
        }
      } else {
        for (let i = 0; i < 5; i++) {
          newPulsingSquares.push(`${i}-${4 - i}`);
        }
      }
    });

    if (newIsBingo) {
      newAnimations.push("bingo");
      // Add all squares to pulsing for bingo celebration
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          newPulsingSquares.push(`${row}-${col}`);
        }
      }
    }

    if (newAnimations.length > 0) {
      setAnimatingElements(newAnimations);
      setPulsingSquares(newPulsingSquares);
      setTimeout(() => {
        setAnimatingElements([]);
        setPulsingSquares([]);
      }, 3000);
    }
  }, []);
  const markSquare = async (row: number, col: number, id: number) => {
    if (grid[row][col].marked) return;
    checkForWins(grid);
    // If wallet is connected, interact with smart contract
    if (isConnected && address) {
      try {
        console.log(
          `Marking square on contract: row ${row}, col ${col}, id ${id}`,
        );
        await markSquareOnContract(id);

        // Reload grid from contract after successful transaction
        getFormattedGrid();
      } catch (error) {
        console.error("Failed to mark square on contract:", error);
        // Fall back to local state update if contract call fails
        updateLocalGrid(row, col);
      }
    } else {
      // Update local state if wallet not connected
      updateLocalGrid(row, col);
    }
  };

  const updateLocalGrid = (row: number, col: number) => {
    const newGrid = grid.map((gridRow, rowIndex) =>
      gridRow.map((square, colIndex) => {
        if (rowIndex === row && colIndex === col) {
          return { ...square, marked: true };
        }
        return square;
      }),
    );

    setGrid(newGrid);
    checkForWins(newGrid);
  };

  const getSquareClasses = (row: number, col: number, square: BingoSquare) => {
    const baseClasses =
      "relative w-24 h-24 border-2 flex items-center justify-center text-xs font-bold cursor-pointer transition-all duration-500 ease-in-out transform hover:scale-110 hover:shadow-xl hover:z-10 p-1";

    let classes = baseClasses;
    const squareId = `${row}-${col}`;
    const isPulsing = pulsingSquares.includes(squareId);

    // Base styling
    if (square.marked) {
      classes +=
        " bg-gradient-to-br from-emerald-400 to-emerald-600 text-white border-emerald-500 shadow-lg";
    } else {
      classes +=
        " bg-gradient-to-br from-white to-gray-50 text-gray-800 border-gray-300 shadow-md hover:from-gray-50 hover:to-gray-100";
    }

    // Add loading state for contract operations
    if (isBingoBoardLoading) {
      classes += " opacity-75 cursor-not-allowed";
    }

    // Completion animations with enhanced effects
    if (completedRows.includes(row)) {
      classes +=
        " animate-pulse ring-4 ring-green-400 ring-opacity-75 bg-gradient-to-r from-green-400 to-emerald-500";
    }
    if (completedCols.includes(col)) {
      classes +=
        " animate-pulse ring-4 ring-blue-400 ring-opacity-75 bg-gradient-to-r from-blue-400 to-cyan-500";
    }
    if (completedDiagonals.includes("main") && row === col) {
      classes +=
        " animate-pulse ring-4 ring-purple-400 ring-opacity-75 bg-gradient-to-r from-purple-400 to-pink-500";
    }
    if (completedDiagonals.includes("anti") && row === 4 - col) {
      classes +=
        " animate-pulse ring-4 ring-purple-400 ring-opacity-75 bg-gradient-to-r from-purple-400 to-pink-500";
    }
    if (isBingo) {
      classes +=
        " animate-bounce ring-4 ring-yellow-400 ring-opacity-90 bg-gradient-to-r from-yellow-400 to-orange-500 shadow-2xl";
    }

    // Add pulsing effect for winning squares
    if (isPulsing && !isBingo) {
      classes += " animate-pulse scale-105";
    }

    return classes;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-6">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full opacity-10 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-4xl w-full">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 mb-6 animate-pulse">
            WEB3 BINGO
          </h1>
          <div className="flex justify-center space-x-12 text-4xl font-bold mb-6">
            <span className="text-red-400 animate-bounce delay-100">B</span>
            <span className="text-orange-400 animate-bounce delay-200">I</span>
            <span className="text-yellow-400 animate-bounce delay-300">N</span>
            <span className="text-green-400 animate-bounce delay-400">G</span>
            <span className="text-blue-400 animate-bounce delay-500">O</span>
          </div>

          {/* Wallet Connection */}
          { isConnected && (
            <div className="mb-8 z-10 relative">
              <WalletConnection />
            </div>)
          }

          {/* Connection Status */}
          {isConnected && (
            <div className="flex justify-center mb-4">
              <div className="mb-4 p-4 bg-green-500/20 backdrop-blur-md max-w-[30vw]   rounded-xl border border-green-500/30">
                <p className="text-green-400 font-semibold">
                  🔗 Connected to Base Network
                </p>
                {nftUrl ? (
                  <p className="text-white/80 text-sm mt-1">
                    You can view your Bingo DNFT on Opensea{" "}
                    <a
                      href={"https://testnets.opensea.io/account"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      here
                    </a>
                  </p>
                ) : (
                  <p className="text-white/80 text-sm mt-1">
                    Your Bingo progress is now saved on-chain!
                    <br />
                    Complete your Bingo card to mint your DNFT.
                  </p>
                )}
              </div>
            </div>
          )}
          {/* spend permissions */}

          {isBingoBoardLoading && (
            <div className="flex justify-center mb-4">
              <div className="mb-4 p-4 bg-blue-500/20 backdrop-blur-md max-w-[30vw]  rounded-xl border border-blue-500/30">
                <p className="text-blue-400 font-semibold">
                  ⏳ Processing blockchain transaction...
                </p>
              </div>
            </div>
          )}
          {isMemberError && (
            <div className="flex justify-center mb-4">
              <div className="mb-4 p-4 bg-red-500/20 backdrop-blur-md max-w-[30vw] rounded-xl border border-red-500/30">
                <p className="text-red-400 font-semibold">
                  ❌ Error loading membership status
                </p>
                <p className="text-white/80 text-sm mt-1">
                  Please refresh or reconnect your wallet.
                </p>
              </div>
            </div>
          )}
        </div>
        {/* Bingo celebration */}
        {isBingo && (
          <div className="mb-8 text-center">
            <div className="relative">
              <h2 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 animate-bounce">
                🎉 BINGO! 🎉
              </h2>
              <div className="absolute inset-0 text-8xl font-black text-yellow-400 opacity-30 animate-ping">
                🎉 BINGO! 🎉
              </div>
            </div>
            <p className="text-2xl text-white font-semibold mt-4 animate-pulse">
              Congratulations! You&rsquo;ve achieved BINGO!
            </p>
          </div>
        )}
        {/* Game Board */}
        {isConnected && (
          <div className="flex justify-center mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
              <div className="grid grid-cols-5 gap-3 p-4">
                {grid.map((row, rowIndex) =>
                  row.map((square, colIndex) => (
                    <div
                      key={square.id}
                      className={getSquareClasses(rowIndex, colIndex, square)}
                      onClick={() =>
                        markSquare(rowIndex, colIndex, Number(square.id))
                      }
                    >
                      <span className="relative z-10 text-center text-xs leading-tight">
                        {square.text}
                        {square.marked}
                        {square.id}
                      </span>

                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-full group-hover:animate-shimmer"></div>
                    </div>
                  )),
                )}
              </div>
            </div>
          </div>
        )}
        {/* Stats */}
        <div className="text-center mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 max-w-md mx-auto">
            <div className="grid grid-cols-3 gap-4 text-white">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">
                  {completedRows.length}
                </div>
                <div className="text-sm font-medium opacity-80">Rows</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {completedCols.length}
                </div>
                <div className="text-sm font-medium opacity-80">Columns</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">
                  {completedDiagonals.length}
                </div>
                <div className="text-sm font-medium opacity-80">Diagonals</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="text-2xl font-bold text-yellow-400">
                Total Lines:{" "}
                {completedRows.length +
                  completedCols.length +
                  completedDiagonals.length}
              </div>
            </div>
          </div>
        </div>
        {/* Game Controls */}
        <div className="text-center space-y-4">
          <div className="flex justify-center space-x-4">
            {/* {isConnected && (
              <Button 
                onClick={loadContractGrid}
                variant="secondary"
                size="lg"
                className="px-8 py-4 text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300 shadow-2xl border-0 rounded-2xl"
                disabled={contractLoading}
              >
                🔄 Sync from Chain
              </Button>
            )} */}
          </div>
        </div>
      </div>

      {/* Floating celebration messages */}
      {animatingElements.length > 0 && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="text-center space-y-4">
            {animatingElements.includes("bingo") && (
              <div className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 animate-bounce">
                🏆 CHAMPION! 🏆
              </div>
            )}
            {animatingElements.some((el) => el.startsWith("row-")) && (
              <div className="text-5xl font-bold text-green-400 animate-pulse drop-shadow-lg">
                ✨ Row Complete! ✨
              </div>
            )}
            {animatingElements.some((el) => el.startsWith("col-")) && (
              <div className="text-5xl font-bold text-blue-400 animate-pulse drop-shadow-lg">
                ⚡ Column Complete! ⚡
              </div>
            )}
            {animatingElements.some((el) => el.startsWith("diag-")) && (
              <div className="text-5xl font-bold text-purple-400 animate-pulse drop-shadow-lg">
                💎 Diagonal Complete! 💎
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


