/* eslint-disable react/require-default-props */
import React from 'react';
import { initialTilesRandom, TileMeta } from '../Tile';

interface NewGameButtonProps {
  setGameOver: React.Dispatch<React.SetStateAction<boolean>>;
  setTilesArr: React.Dispatch<React.SetStateAction<TileMeta[]>>;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  restartButtonRef?: React.MutableRefObject<null>;
}

function NewGameButton({
  setGameOver,
  setTilesArr,
  setScore,
  restartButtonRef
}: NewGameButtonProps) {
  return (
    <div className="">
      <button
        onClick={() => {
          setGameOver(false);
          setTilesArr(initialTilesRandom());
          setScore(0);
        }}
        ref={restartButtonRef}
        type="button"
        className="text-white px-2 sm:px-4 py-1 sm:py-2 rounded-[3px] font-bold bg-purple-600 hover:bg-purple-700 text-white font-bold
        text-md cursor-pointer inline-block h-full whitespace-normal text-center w-1/2"
      >
        New Game
      </button>
    </div>
  );
}

export default NewGameButton;
