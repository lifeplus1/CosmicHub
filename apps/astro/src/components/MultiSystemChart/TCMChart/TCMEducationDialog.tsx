import React, { useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import { Button } from '@cosmichub/ui';
import type { TCMEducationDialogProps } from './utils/types';

/**
 * Educational dialog component for TCM concepts
 * Provides reusable educational content display with proper accessibility
 */
export const TCMEducationDialog: React.FC<TCMEducationDialogProps> = React.memo(function TCMEducationDialog({
  isOpen,
  topic,
  content,
  onClose
}) {
  // Memoized event handlers for performance
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  }, [handleClose]);

  if (!content) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content 
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-2xl max-h-[85vh] overflow-y-auto cosmic-card bg-gradient-to-br from-cosmic-dark to-cosmic-blue border border-cosmic-gold/30 p-6 rounded-lg"
          onKeyDown={handleKeyDown}
          aria-labelledby="dialog-title"
          aria-describedby="dialog-description"
        >
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title 
              id="dialog-title"
              className="text-xl font-semibold text-cosmic-gold font-cinzel"
            >
              {content.title}
            </Dialog.Title>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="icon"
              className="text-cosmic-silver hover:text-cosmic-gold transition-colors"
              aria-label="Close educational dialog"
            >
              <Cross2Icon className="w-4 h-4" />
            </Button>
          </div>
          
          <div id="dialog-description" className="space-y-4">
            <p className="text-cosmic-silver/90 text-base leading-relaxed">
              {content.description}
            </p>
            
            <div className="space-y-4">
              {content.sections.map((section, index) => (
                <div 
                  key={`${topic}-section-${index}`}
                  className="bg-cosmic-dark/30 border border-cosmic-purple/20 rounded-lg p-4"
                >
                  <h3 className="text-lg font-medium text-cosmic-gold mb-2 font-cinzel">
                    {section.title}
                  </h3>
                  <p className="text-cosmic-silver/80 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <Button
              onClick={handleClose}
              variant="cosmic"
              className="px-6"
            >
              Got it
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});

TCMEducationDialog.displayName = 'TCMEducationDialog';
