import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import InterpretationDisplay from './InterpretationDisplay';
import type { InterpretationModalProps } from './types';

const InterpretationModal: React.FC<InterpretationModalProps> = ({ interpretation, isOpen, onClose }) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cosmic-dark p-0 rounded-xl border border-cosmic-gold/20 max-w-4xl w-full max-h-[90vh] overflow-hidden z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
          aria-labelledby={`modal-title-${interpretation.id}`}
          role="dialog"
          aria-modal="true"
        >
          {/* Modal Header with Close Button */}
          <div className="sticky top-0 bg-cosmic-dark/95 backdrop-blur-sm border-b border-cosmic-gold/20 p-4 flex items-center justify-between z-10">
            <Dialog.Title id={`modal-title-${interpretation.id}`} className="text-xl font-playfair text-cosmic-gold">
              {interpretation.title !== '' && interpretation.title.length > 0 ? interpretation.title : `${interpretation.type} Interpretation`}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="h-8 w-8 rounded-full bg-cosmic-silver/10 hover:bg-cosmic-silver/20 text-cosmic-silver hover:text-cosmic-gold transition-colors flex items-center justify-center"
                aria-label="Close modal"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                >
                  <path
                    d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </Dialog.Close>
          </div>

          {/* Modal Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            <InterpretationDisplay 
              interpretation={interpretation} 
              showFullContent={true}
              loading={false}
              error={null}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default InterpretationModal;
