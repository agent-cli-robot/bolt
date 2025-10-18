import { AnimatePresence, motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { classNames } from '~/utils/classNames';

interface PlusButtonProps {
  show: boolean;
  enhancingPrompt?: boolean;
  promptEnhanced?: boolean;
  onEnhancePrompt?: () => void;
  onAttachFile?: () => void;
}

export function PlusButton({ 
  show, 
  enhancingPrompt = false, 
  promptEnhanced = false, 
  onEnhancePrompt,
  onAttachFile 
}: PlusButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        menuRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handlePlusClick = () => {
    setIsOpen(!isOpen);
  };

  const handleEnhancePrompt = () => {
    onEnhancePrompt?.();
    setIsOpen(false);
  };

  const handleAttachFile = () => {
    onAttachFile?.();
    setIsOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {show && (
          <motion.button
            ref={buttonRef}
            className="absolute flex justify-center items-center top-[18px] left-[22px] p-1 bg-bolt-elements-item-backgroundAccent hover:bg-bolt-elements-item-backgroundAccentHover text-bolt-elements-textPrimary rounded-md w-[34px] h-[34px] transition-theme border border-bolt-elements-borderColor"
            transition={{ ease: [0.4, 0, 0.2, 1], duration: 0.17 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={handlePlusClick}
          >
            <div className="text-lg">
              <div className="i-ph:plus"></div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            className="absolute top-[60px] left-[22px] bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded-lg shadow-2xl backdrop-filter backdrop-blur-[8px] z-50 min-w-[200px] overflow-hidden"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <div className="py-2">
              <button
                className={classNames(
                  "w-full px-4 py-3 text-left text-sm text-white hover:bg-bolt-elements-item-backgroundAccent transition-theme flex items-center gap-3 first:rounded-t-lg border-b border-bolt-elements-borderColor last:border-b-0",
                  {
                    "opacity-50 cursor-not-allowed": enhancingPrompt,
                  }
                )}
                onClick={handleEnhancePrompt}
                disabled={enhancingPrompt}
              >
                {enhancingPrompt ? (
                  <>
                    <div className="i-svg-spinners:90-ring-with-bg text-white text-lg"></div>
                    <span>Enhancing prompt...</span>
                  </>
                ) : (
                  <>
                    <div className="i-bolt:stars text-white text-lg"></div>
                    <span>Enhance Prompt</span>
                    {promptEnhanced && <div className="ml-auto text-xs text-green-400">Enhanced</div>}
                  </>
                )}
              </button>
              
              <button
                className="w-full px-4 py-3 text-left text-sm text-white hover:bg-bolt-elements-item-backgroundAccent transition-theme flex items-center gap-3 last:rounded-b-lg"
                onClick={handleAttachFile}
              >
                <div className="i-ph:paperclip text-white text-lg"></div>
                <span>Attach File</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
