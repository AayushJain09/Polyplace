import { useState, useEffect, useRef } from 'react';

const AIChat = ({ isOpen, onClose }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setIsLoaded(false);
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.src = 'https://cdn.botpress.cloud/webchat/v2.3/shareable.html?configUrl=https://files.bpcontent.cloud/2025/04/07/18/20250407180933-GQR23J3A.json';
    iframe.frameBorder = '0';
    iframe.width = '100%';
    iframe.height = '100%'; // Full height of container
    iframe.style.borderRadius = '8px';
    iframe.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    iframeRef.current = iframe;

    const container = document.getElementById('chatbot-container');
    if (container) {
      container.appendChild(iframe);
      setIsLoaded(true);
    }

    return () => {
      if (container && iframe.parentNode) {
        container.removeChild(iframe);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-28 right-4 w-[40%] sm:w-96 h-[500px] bg-white dark:bg-nft-black-3 rounded-xl shadow-lg flex flex-col z-50">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b dark:border-nft-black-1 border-nft-gray-1">
        <h3 className="font-poppins dark:text-white text-nft-black-1 font-semibold text-lg">
          Chatbot Assistant
        </h3>
        <button
          onClick={onClose}
          className="text-nft-gray-2 dark:text-nft-gray-1 hover:text-nft-black-1 dark:hover:text-white text-xl"
        >
          ✕
        </button>
      </div>

      {/* Chatbot Iframe Container */}
      <div
        id="chatbot-container"
        className="flex-1 overflow-hidden rounded-b-xl"
      >
        {!isLoaded && (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-600 dark:text-gray-300 font-poppins text-sm">
              Loading chatbot...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChat;