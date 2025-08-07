import React, { useState, lazy, Suspense } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import * as Dialog from '@radix-ui/react-dialog';

const FundamentalsTab = lazy(() => import('./FundamentalsTab'));
const SignsTab = lazy(() => import('./SignsTab'));
const PlanetsTab = lazy(() => import('./PlanetsTab'));
const HousesTab = lazy(() => import('./HousesTab'));
const AspectsTab = lazy(() => import('./AspectsTab'));
const HowToUseTab = lazy(() => import('./HowToUseTab'));

interface AstrologyGuideProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: number;
}

export const AstrologyGuide: React.FC<AstrologyGuideProps> = React.memo(({ 
  isOpen, 
  onClose, 
  initialTab = 0 
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-md" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-cosmic-dark/95 rounded-3xl border border-gold-600 overflow-hidden max-h-[80vh] w-full max-w-4xl">
          <div className="py-6 border-b bg-gradient-to-b from-cosmic-dark/98 to-cosmic-dark/85 border-gold-600">
            <div className="flex items-center justify-between px-6">
              <h2 className="flex-1 text-3xl font-bold text-center text-gold-300 font-cinzel">Astrology Guide</h2>
              <Dialog.Close asChild>
                <button className="text-gold-300 hover:text-gold-400" aria-label="Close">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </Dialog.Close>
            </div>
          </div>
          <div className="p-0 overflow-y-auto">
            <Tabs.Root defaultValue={activeTab.toString()} onValueChange={(value) => setActiveTab(parseInt(value))}>
              <Tabs.List className="sticky top-0 z-10 flex px-4 border-b border-gold-600 bg-cosmic-dark/95" aria-label="Astrology Guide Tabs">
                <Tabs.Trigger value="0" className="px-4 py-4 data-[state=active]:text-gold-300 data-[state=active]:border-b-2 data-[state=active]:border-gold-300 text-cosmic-silver/60 font-semibold text-sm">
                  Fundamentals
                </Tabs.Trigger>
                <Tabs.Trigger value="1" className="px-4 py-4 data-[state=active]:text-gold-300 data-[state=active]:border-b-2 data-[state=active]:border-gold-300 text-cosmic-silver/60 font-semibold text-sm">
                  Signs
                </Tabs.Trigger>
                <Tabs.Trigger value="2" className="px-4 py-4 data-[state=active]:text-gold-300 data-[state=active]:border-b-2 data-[state=active]:border-gold-300 text-cosmic-silver/60 font-semibold text-sm">
                  Planets
                </Tabs.Trigger>
                <Tabs.Trigger value="3" className="px-4 py-4 data-[state=active]:text-gold-300 data-[state=active]:border-b-2 data-[state=active]:border-gold-300 text-cosmic-silver/60 font-semibold text-sm">
                  Houses
                </Tabs.Trigger>
                <Tabs.Trigger value="4" className="px-4 py-4 data-[state=active]:text-gold-300 data-[state=active]:border-b-2 data-[state=active]:border-gold-300 text-cosmic-silver/60 font-semibold text-sm">
                  Aspects
                </Tabs.Trigger>
                <Tabs.Trigger value="5" className="px-4 py-4 data-[state=active]:text-gold-300 data-[state=active]:border-b-2 data-[state=active]:border-gold-300 text-cosmic-silver/60 font-semibold text-sm">
                  How to Use
                </Tabs.Trigger>
              </Tabs.List>
              <Suspense fallback={<div className="mx-auto mt-6 text-4xl text-purple-500 animate-spin">⭐</div>}>
                <Tabs.Content value="0" className="p-6">
                  <FundamentalsTab />
                </Tabs.Content>
                <Tabs.Content value="1" className="p-6">
                  <SignsTab />
                </Tabs.Content>
                <Tabs.Content value="2" className="p-6">
                  <PlanetsTab />
                </Tabs.Content>
                <Tabs.Content value="3" className="p-6">
                  <HousesTab />
                </Tabs.Content>
                <Tabs.Content value="4" className="p-6">
                  <AspectsTab />
                </Tabs.Content>
                <Tabs.Content value="5" className="p-6">
                  <HowToUseTab />
                </Tabs.Content>
              </Suspense>
            </Tabs.Root>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});

AstrologyGuide.displayName = 'AstrologyGuide';

export { useAstrologyGuide } from './useAstrologyGuide';