import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen, title = 'New Game ?', message, onConfirm, onCancel
  }) => {
    if (!isOpen) return null;
    return (
        <div
        className="fixed inset-0 z-50 bg-gray-300 bg-opacity-70 transition-opacity flex items-center justify-center"
      >
        <div className="bg-[#2b2670] items-center rounded p-6 max-w-sm w-full z-10 shadow-lg text-center">
          <h2 className="text-lg font-bold mb-4">{title}</h2>
          <p className="mb-6">{message}</p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

export default ConfirmModal;
