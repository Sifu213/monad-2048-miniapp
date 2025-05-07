import React, { useEffect, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { fetchTop, LeaderboardEntry } from '@/lib/leaderboard';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  limit?: number;
}

export default function LeaderboardModal({
  isOpen,
  onClose,
  limit = 10
}: LeaderboardModalProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetchTop(limit)
      .then((data) => setEntries(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isOpen, limit]);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-30"    
        onClose={onClose}
      >
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-70" />
        </Transition.Child>

        {/* Centering container */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200 transform"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150 transform"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            {/* PANEL: toute la zone « inside click » */}
            <Dialog.Panel className="bg-[#2b2670] rounded-lg p-6 max-w-sm w-full text-center shadow-xl">
              <Dialog.Title className="text-2xl font-bold mb-4 text-white">
                🏆 Leaderboard
              </Dialog.Title>

              {loading ? (
                <p className="text-white">Loading…</p>
              ) : (
                <ol className="space-y-2 text-white">
                  {entries.map((e, i) => (
                    <li
                      key={e.user_id}
                      className="flex justify-between font-medium"
                    >
                      <span>
                        {i + 1}.{' '}
                        <a
                          href={`https://warpcast.com/${e.user_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          {e.username}
                        </a>
                      </span>
                      <span>{e.top_score}</span>
                    </li>
                  ))}
                </ol>
              )}

              <button
                onClick={onClose}
                className="mt-6 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
              >
                Close
              </button>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
