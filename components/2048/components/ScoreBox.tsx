import React from 'react';

interface ScoreBoxProps {
  label: string;
  score: number;
}

function ScoreBox({ label, score }: ScoreBoxProps) {
  return (
    <div
      className="text-xl sm:text-2xl px-2 sm:px-4 text-center rounded-5px bg-[#A0055D] "
      
    >
      <div
        className="uppercase tracking-wider text-xs font-bold"
        
      >
        {label}
      </div>
      <div className="text-white font-bold">{score}</div>
    </div>
  );
}

export default ScoreBox;
