/* eslint-disable react/require-default-props */
import React, { useState, useEffect, Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import useMovement from './hooks/useMovement';
import useLocalStorage from './hooks/useLocalStorage';
import { FarcasterActions } from "@/components/Home/FarcasterActions";
import { APP_URL } from "@/lib/constants";
import { useMiniAppContext } from "@/hooks/use-miniapp-context";

import { parseEther} from "viem";
import { monadTestnet } from "viem/chains";
import {
  useAccount,
  useDisconnect,
  useSendTransaction,
  useSwitchChain,
  useWriteContract ,
  useWaitForTransactionReceipt,
} from "wagmi";
import { NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI } from "./lib/constants";


import {
  TileMeta,
  Tile,
  spawnTileRandom,
  friendlySpawnTile,
  initialTilesRandom,
  getTransition,
  colorMapper,
  removeMarkedTiles
} from './Tile';
import validBoard from './Grid';
import { flatIdx, matrixIndices } from './utils/coordinateUtils';
import ScoreBox from './components/ScoreBox';
import NewGameButton from './components/NewGameButton';
import NewGameButton2 from './components/NewGameButton2';
import MyToggle from './components/MyToggle';

interface Props {
  initialTiles?: TileMeta[];
  noSpawnNewTile?: boolean;
}

function App({ initialTiles, noSpawnNewTile }: Props) {
  const [tilesArr, setTilesArr] = useState<TileMeta[]>(
    initialTiles || initialTilesRandom()
  );
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useLocalStorage('bestScore', 0);
  const restartButtonRef = useRef(null);
  const [friendlySpawning, setFriendlySpawning] = useState(true);

  const { context } = useMiniAppContext();
  const { actions } = useMiniAppContext();

  const { isEthProviderAvailable } = useMiniAppContext();
  const { isConnected, address, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  
 
  const {
    data: hash, // infos sur la transaction envoyée, ex { hash }      
    isPending,       // true pendant la demande de signature (wallet)
    isSuccess,       // true si la TX a bien été envoyée, en attente de minage
    writeContract,           // la fonction qui déclenche l'envoi
    error,
} = useWriteContract();

const { isLoading: isConfirming, isSuccess: isConfirmed } =
useWaitForTransactionReceipt({
  hash,
});

const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
const [claimMessage, setClaimMessage] = useState<string | null>(null);
const [hasMinted, setHasMinted] = useState(false);
const link = "https://monad-testnet.socialscan.io/tx/" + hash


  const handleMint = async () => {
    if (!address) {
        setClaimMessage('Please connect your wallet.');
        return;
    }
    if (chainId !== monadTestnet.id) {
      await switchChain?.({ chainId: monadTestnet.id });
    }

    setIsSubmitting(true);
    try {
            await writeContract({
                address: NFT_CONTRACT_ADDRESS,
                abi: NFT_CONTRACT_ABI,
                functionName: 'mintNFT',
                args: [address, score],
            });

            console.log('Transaction sent');
            setHasMinted(true);

        } catch (err) {
            console.error('Mint transaction failed:', err);
            setClaimMessage('Minting failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
      if (!gameOver) {
        setHasMinted(false);
        setClaimMessage(null);
      }
    }, [gameOver]);

  type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  function slideHandler(dir: Direction) {
    let validMove = false;
    const newTilesArr = removeMarkedTiles(tilesArr);
    // mapping of flat index to position in tilesArr
    const flatToArrPosMap = new Map<number, number>();
    newTilesArr.forEach(({ idx }, arrIdx) => {
      flatToArrPosMap.set(idx, arrIdx);
    });

    const reverseIteration = !!(dir === 'DOWN' || dir === 'RIGHT');
    const horizontalMove = !!(dir === 'LEFT' || dir === 'RIGHT');

    interface MoveTileProps {
      i: number;
      j: number;
      currTileArrIdx: number;
      nextSpotIdx: number;
    }

    function moveTile({
      i,
      j,
      currTileArrIdx,
      nextSpotIdx
    }: MoveTileProps): number {
      const currFlatIdx = newTilesArr[currTileArrIdx].idx;

      // default up
      let mergeFlatIdx = () => flatIdx(nextSpotIdx - 1, j);
      let mergeTransition = () => getTransition(nextSpotIdx - 1, j);
      if (dir === 'DOWN') {
        mergeFlatIdx = () => flatIdx(nextSpotIdx + 1, j);
        mergeTransition = () => getTransition(nextSpotIdx + 1, j);
      } else if (dir === 'LEFT') {
        mergeFlatIdx = () => flatIdx(i, nextSpotIdx - 1);
        mergeTransition = () => getTransition(i, nextSpotIdx - 1);
      } else if (dir === 'RIGHT') {
        mergeFlatIdx = () => flatIdx(i, nextSpotIdx + 1);
        mergeTransition = () => getTransition(i, nextSpotIdx + 1);
      }

      const moveFlatIdx = () =>
        horizontalMove ? flatIdx(i, nextSpotIdx) : flatIdx(nextSpotIdx, j);
      const moveTransition = () =>
        horizontalMove
          ? getTransition(i, nextSpotIdx)
          : getTransition(nextSpotIdx, j);

      let currTile = newTilesArr[currTileArrIdx];
      const mergeTileIdx = flatToArrPosMap.get(mergeFlatIdx());
      let mergeTile = mergeTileIdx !== undefined && newTilesArr[mergeTileIdx];

      if (
        ((!reverseIteration && nextSpotIdx > 0) ||
          (reverseIteration && nextSpotIdx < 3)) &&
        mergeTileIdx !== undefined &&
        mergeTile &&
        mergeTile.value === currTile.value
      ) {
        // merge
        validMove = true;
        mergeTile = {
          ...mergeTile,
          shouldDelete: true,
          zIndex: 10
        };
        currTile = {
          ...currTile,
          zIndex: 20,
          shouldDelete: true,
          idx: mergeFlatIdx(),
          transition: mergeTransition()
        };
        const newTile = Tile({
          i: matrixIndices(mergeTile.idx).i,
          j: matrixIndices(mergeTile.idx).j,
          value: mergeTile.value * 2,
          state: 'MERGE',
          transition: mergeTransition()
        });
        newTilesArr[mergeTileIdx] = mergeTile;
        newTilesArr[currTileArrIdx] = currTile;
        newTilesArr.push(newTile);
        flatToArrPosMap.set(currFlatIdx, newTilesArr.length - 1);
        flatToArrPosMap.delete(currFlatIdx);
        flatToArrPosMap.delete(mergeFlatIdx());
        const currTotalScore = score + newTile.value;
        setScore(currTotalScore);
        if (score + newTile.value > bestScore) {
          setBestScore(currTotalScore);
        }
        return nextSpotIdx;
      }
      if (
        (horizontalMove && j !== nextSpotIdx) ||
        (!horizontalMove && i !== nextSpotIdx)
      ) {
        validMove = true;
        flatToArrPosMap.set(moveFlatIdx(), currTileArrIdx);
        currTile = {
          ...currTile,
          idx: moveFlatIdx(),
          transition: moveTransition()
        };
        newTilesArr[currTileArrIdx] = currTile;
        flatToArrPosMap.delete(currFlatIdx);
        return reverseIteration ? nextSpotIdx - 1 : nextSpotIdx + 1;
      }
      return reverseIteration ? nextSpotIdx - 1 : nextSpotIdx + 1;
    }

    let currTileArrIdx;
    if (dir === 'UP') {
      for (let j = 0; j < 4; j += 1) {
        let nextSpotIdx = 0;
        for (let i = 0; i < 4; i += 1) {
          currTileArrIdx = flatToArrPosMap.get(flatIdx(i, j));
          if (currTileArrIdx !== undefined) {
            nextSpotIdx = moveTile({
              i,
              j,
              currTileArrIdx,
              nextSpotIdx
            });
          }
        }
      }
    } else if (dir === 'DOWN') {
      for (let j = 0; j < 4; j += 1) {
        let nextSpotIdx = 3;
        for (let i = 3; i >= 0; i -= 1) {
          currTileArrIdx = flatToArrPosMap.get(flatIdx(i, j));
          if (currTileArrIdx !== undefined) {
            nextSpotIdx = moveTile({
              i,
              j,
              currTileArrIdx,
              nextSpotIdx
            });
          }
        }
      }
    } else if (dir === 'LEFT') {
      for (let i = 0; i < 4; i += 1) {
        let nextSpotIdx = 0;
        for (let j = 0; j < 4; j += 1) {
          currTileArrIdx = flatToArrPosMap.get(flatIdx(i, j));
          if (currTileArrIdx !== undefined) {
            nextSpotIdx = moveTile({
              i,
              j,
              currTileArrIdx,
              nextSpotIdx
            });
          }
        }
      }
    } else if (dir === 'RIGHT') {
      for (let i = 0; i < 4; i += 1) {
        let nextSpotIdx = 3;
        for (let j = 3; j >= 0; j -= 1) {
          currTileArrIdx = flatToArrPosMap.get(flatIdx(i, j));
          if (currTileArrIdx !== undefined) {
            nextSpotIdx = moveTile({
              i,
              j,
              currTileArrIdx,
              nextSpotIdx
            });
          }
        }
      }
    }
    if (!validMove) {
      return;
    }

    if (noSpawnNewTile === undefined || !noSpawnNewTile) {
      if (friendlySpawning) {
        friendlySpawnTile({ tilesArr: newTilesArr });
      } else {
        spawnTileRandom({ tilesArr: newTilesArr });
      }
    }

    setTilesArr(newTilesArr);
    if (!validBoard(newTilesArr)) {
      setGameOver(true);
    }
  }

  const swipeRef = useMovement({
    onMoveUp: () => slideHandler('UP'),
    onMoveDown: () => slideHandler('DOWN'),
    onMoveLeft: () => slideHandler('LEFT'),
    onMoveRight: () => slideHandler('RIGHT')
  });

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto   ">
      <Transition.Root show={gameOver} as={Fragment}>
        <Dialog
          as="div"
          className="fixed z-50 inset-0"
          initialFocus={restartButtonRef}
          onClose={setGameOver}
        >
          <div
            className={`flex items-end justify-center 
           text-center sm:block sm:p-0`}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-700 delay-100"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay
                className={`fixed inset-0 bg-gray-300 
              bg-opacity-70 transition-opacity cursor-pointer`}
                onClick={() => {
                  setGameOver(false);
                  setTilesArr(initialTilesRandom());
                  setScore(0);
                }}
              />
            </Transition.Child>

            {/* This element is to trick the browser
             into centering the modal contents. */}
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-700 delay-100"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-300"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div
                className={`inline-block rounded-lg 
                overflow-hidden transform transition-all 
                -my-16 sm:my-0 text-center`}
              >
                <div className="flex flex-col mt-32">
                  <div
                    className="text-7xl sm:text-8xl mb-10 sm:mb-32
                  font-bold text-[#2b2670] opacity-100"
                  >
                    Game Over!
                  </div>

                  <div
                    className="text-4xl sm:text-5xl mb-10 sm:mb-32
                    font-bold text-[#2b2670] opacity-100"
                  >
                    Score: {score}
                  </div>

                  <button
                    className="w-1/2 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-[3px] font-bold bg-purple-600 hover:bg-purple-700 text-white font-bold
                      text-md cursor-pointer w-fit self-center mb-2"
                    type="button"
                    onClick={() =>
                      actions?.composeCast({
                        text: `I just made the score of ${score} on the Monad 2048 MiniApp!. Can you break it?`,
                        embeds: [`${APP_URL}`],
                      })
                    }
                  >
                    Cast my score
                  </button>

                  <button
                    className="w-1/2 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-[3px] font-bold bg-purple-600 hover:bg-purple-700 text-white font-bold
                      text-md cursor-pointer w-fit self-center mb-2"
                    type="button" 
                    onClick={handleMint}  
                    disabled={isPending || isSubmitting || isConfirming || hasMinted }                                     
                  >
                    {isSubmitting ? "Submitting..." : 
                                    isPending ? "Pending..." : 
                                    isConfirming ? "Confirming..." : 
                                    hasMinted ? "Claimed!" :                                    
                                    "Claim your NFT"}
                  </button>
                  {claimMessage && (
                      <p className={`mt-4 ${claimMessage.includes('success') ? 'text-green-500' : 'text-red-400'}`}>
                          {claimMessage}
                      </p>
                  )}
                 

                  <NewGameButton2
                    setGameOver={setGameOver}
                    setTilesArr={setTilesArr}
                    setScore={setScore}
                    restartButtonRef={restartButtonRef}                    
                  />
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
      <div className="w-full mt-2 sm:px-0">
        <div className="flex justify-between items-center p-2 rounded-[20px] bg-[#2b2670]">
          

          {context?.user?.pfpUrl && (
              <img
                src={context?.user?.pfpUrl}
                className="w-14 h-14 rounded-full"
                alt="User Profile Picture"
                width={56}
                height={56}
              />
            )}
            <div className="flex flex-col justify-start items-start space-y-2">
              <p className="text-sm text-left">
                
                <span className="text-white rounded-md p-[4px] text-l font-bold">
                  {context?.user?.displayName}
                </span>
              </p>
            </div>

          <div className="inline-block text-right">
            <div className="flex space-x-1 float-right">
              <ScoreBox score={score} label="score" />
              <ScoreBox score={bestScore} label="best" />
              <NewGameButton
            setGameOver={setGameOver}
            setTilesArr={setTilesArr}
            setScore={setScore}
          />
            </div>
          </div>
          
        </div>
        
      </div>


      <div className="w-full mt-2 sm:mt-10 ">
        <div>
          <div
            className="absolute transform -translate-x-1/2 left-1/2 
            grid-border rounded-md bg-[#2b2670]"           
          />
        </div>

        <div
          className="grid-center z-10 "
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...swipeRef}
        >
          {tilesArr.map(
            ({ key, value, shouldDelete, zIndex, transition, animation }) => (
              <div
                key={key}
                className={
                  'tile absolute rounded-3px duration-100 transform ' +
                  `${transition}`
                }
                data-testid={shouldDelete ? 'tile-delete' : 'tile'}
              >
                <div
                  className={`tile flex justify-center 
                items-center rounded-3px font-bold
                tile-${value}
                ${colorMapper(value)} z-${zIndex} ${animation}`}
                >
                  {value}
                </div>
              </div>
            )
          )}
        </div>
        <div className=" grid-center bg-[#2b2670]">
          {[0, 1, 2, 3].map((rowIdx) => (
            <div className="flex justify-center grid-col" key={rowIdx}>
              {[0, 1, 2, 3].map((colIdx) => (
                <div
                  className="tile rounded-3px grid-row"
                  style={{ backgroundColor: 'rgba(238, 228, 218, 0.35)' }}
                  key={rowIdx * 4 + colIdx}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <footer className="w-full text-white mx-auto text-sm sm:text-md text-center test px-4 sm:px-0">
        2048 For Monad made by  
        <a href="https://warpcast.com/sifulam" className="underline font-semibold ml-1">
           Sifu_lam
        </a>
        .
      </footer>
    </div>
  );
}

export default App;
