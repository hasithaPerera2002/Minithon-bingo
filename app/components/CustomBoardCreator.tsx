
"use client";

import { useState } from "react";
import { Button } from "./DemoComponents";

type CustomBoardCreatorProps = {
  onCreateBoard: (experiences: string[]) => void;
  onCancel: () => void;
};

export function CustomBoardCreator({ onCreateBoard, onCancel }: CustomBoardCreatorProps) {
  const [experiences, setExperiences] = useState<string[]>(Array(25).fill(""));

  const handleInputChange = (index: number, value: string) => {
    const newExperiences = [...experiences];
    newExperiences[index] = value;
    setExperiences(newExperiences);
  };

  const handleCreateBoard = () => {
    const filteredExperiences = experiences.filter(exp => exp.trim() !== "");
    if (filteredExperiences.length >= 24) { // 24 because center is FREE
      onCreateBoard(experiences);
    } else {
      alert("Please fill in at least 24 experiences (center square is FREE)");
    }
  };

  const fillWithDefaultExperiences = () => {
    const defaultExperiences = [
      "Speedrun Ethereum", "Base Batches", "Only Dust profile", "Cyfrin Solidity 101", "Celo Proof of Ship",
      "Uniswap Hook Inc", "Deploy Smart Contract", "Create NFT Collection", "Build DeFi Protocol", "Contribute to Open Source",
      "Attend Web3 Conference", "Complete Hackathon", "Get GitHub Sponsors", "Build on Layer 2", "Create DAO Proposal",
      "Mint First NFT", "Use MetaMask", "Swap on Uniswap", "Stake ETH", "Bridge Tokens",
      "Write Technical Blog", "Create Web3 Tutorial", "Join Discord Community", "Follow Web3 Twitter", "Read Ethereum Whitepaper"
    ];
    
    const newExperiences = [...defaultExperiences];
    // Fill remaining slots with empty strings if needed
    while (newExperiences.length < 25) {
      newExperiences.push("");
    }
    setExperiences(newExperiences.slice(0, 25));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 max-w-4xl w-full">
        <h2 className="text-4xl font-bold text-white text-center mb-8">Create Your Custom Bingo Board</h2>
        
        <div className="mb-6 text-center">
          <Button
            onClick={fillWithDefaultExperiences}
            variant="secondary"
            className="mr-4"
          >
            Fill with Default Experiences
          </Button>
        </div>

        <div className="grid grid-cols-5 gap-3 mb-8">
          {experiences.map((experience, index) => (
            <div key={index} className="relative">
              {index === 12 ? (
                <div className="w-full h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 border-2 border-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">
                  FREE
                </div>
              ) : (
                <textarea
                  value={experience}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  placeholder={`Experience ${index + 1}`}
                  className="w-full h-20 p-2 text-sm border-2 border-gray-300 rounded-lg resize-none focus:border-purple-500 focus:outline-none"
                  maxLength={50}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center space-x-4">
          <Button
            onClick={handleCreateBoard}
            variant="primary"
            size="lg"
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            Create Custom Board
          </Button>
          <Button
            onClick={onCancel}
            variant="secondary"
            size="lg"
            className="px-8 py-3"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
