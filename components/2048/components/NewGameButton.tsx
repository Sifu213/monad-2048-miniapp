/* eslint-disable react/require-default-props */
import React, { useState } from 'react';
import { initialTilesRandom, TileMeta } from '../Tile';
import ConfirmModal from './ConfirmModal';

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
  const [showConfirm, setShowConfirm] = useState(false);

  const onConfirm = () => {
    setGameOver(false);
    setTilesArr(initialTilesRandom());
    setScore(0);
    setShowConfirm(false);
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        ref={restartButtonRef}
        type="button"
        className="text-white px-2 sm:px-4 py-1 sm:py-2 rounded-[3px] font-bold bg-purple-600 hover:bg-purple-700 text-white font-bold
        text-md cursor-pointer inline-block h-full whitespace-normal text-center max-w-[80px]"
      >
        New game
      </button>

      <ConfirmModal
        isOpen={showConfirm}
        message="The game and your score will be reset. Are you sure?"
        onConfirm={onConfirm}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}

export default NewGameButton;
