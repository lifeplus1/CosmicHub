import React from 'react';
import { getGateLineKeynote, getChannelKeynote } from './gateKeynotes';

export interface GateModalData {
  type: 'gate';
  number: number;
  line: number;
  name: string;
  center: string;
  planet: string;
  planet_symbol: string;
  gateType: 'personality' | 'design';
  position: number;
}

export interface ChannelModalData {
  type: 'channel';
  id: string;
  name: string;
  circuit: string;
  theme: string;
  gates: number[];
}

interface HumanDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: GateModalData | ChannelModalData | null;
}

const HumanDesignModal: React.FC<HumanDesignModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderGateContent = (gateData: GateModalData) => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-cosmic-gold">
          Gate {gateData.number}.{gateData.line}
        </h2>
        <button
          onClick={onClose}
          className="text-cosmic-gold hover:text-cosmic-purple transition-colors text-2xl leading-none"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-cosmic-gold mb-2">{gateData.name}</h3>
          <p className="text-cosmic-text">I Ching Hexagram {gateData.number}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-cosmic-gold">Center</h4>
            <p className="text-cosmic-text">{gateData.center}</p>
          </div>
          <div>
            <h4 className="font-semibold text-cosmic-gold">Activation</h4>
            <p className="text-cosmic-text">
              {gateData.planet_symbol} {gateData.planet} ({gateData.gateType})
            </p>
          </div>
        </div>
        
        <div>
            <h4 className="font-semibold text-cosmic-gold">Line {gateData.line} Keynote</h4>
            <p className="text-cosmic-text italic">
              {getGateLineKeynote(gateData.number, gateData.line)}
            </p>
        </div>
        
        <div className="mt-2">
          <h4 className="font-semibold text-cosmic-gold">Line Mechanics</h4>
          <p className="text-cosmic-text text-sm">
            This line filters the gate&apos;s archetype through a specific role expression. Combine this keynote with your authority &amp; strategy for correct application.
          </p>
        </div>
        
        <div className="mt-6 p-4 bg-cosmic-purple/10 border border-cosmic-purple/30 rounded-lg">
          <h4 className="font-semibold text-cosmic-gold mb-2">Energy Theme</h4>
          <p className="text-cosmic-text text-sm">
            This gate carries the archetypal energy of {gateData.name.toLowerCase()}, 
            activated through your {gateData.planet} in {gateData.gateType === 'personality' ? 'conscious' : 'unconscious'} expression.
          </p>
        </div>
      </div>
    </div>
  );

  const renderChannelContent = (channelData: ChannelModalData) => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-cosmic-gold">
          Channel {channelData.id}
        </h2>
        <button
          onClick={onClose}
          className="text-cosmic-gold hover:text-cosmic-purple transition-colors text-2xl leading-none"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-cosmic-gold mb-2">{channelData.name}</h3>
          <p className="text-cosmic-text font-medium">{channelData.theme}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-cosmic-gold">Circuit</h4>
            <p className="text-cosmic-text">{channelData.circuit}</p>
          </div>
          <div>
            <h4 className="font-semibold text-cosmic-gold">Gates</h4>
            <p className="text-cosmic-text">Gates {channelData.gates.join(' - ')}</p>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-cosmic-gold">Channel Keynote</h4>
          <p className="text-cosmic-text italic">
            {getChannelKeynote(channelData.id)}
          </p>
        </div>
        
        <div className="mt-6 p-4 bg-cosmic-purple/10 border border-cosmic-purple/30 rounded-lg">
          <h4 className="font-semibold text-cosmic-gold mb-2">Defined Connection</h4>
          <p className="text-cosmic-text text-sm">
            This channel creates a defined connection between centers, establishing consistent life force energy 
            and reliable patterns in your Human Design. The {channelData.circuit.toLowerCase()} circuit carries 
            the theme of {channelData.theme.toLowerCase()}.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
      onKeyDown={(e) => { if (e.key === 'Escape') { onClose(); } }}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      <div className="bg-cosmic-dark border border-cosmic-purple/30 rounded-lg shadow-2xl shadow-cosmic-purple/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {data.type === 'gate' ? renderGateContent(data) : renderChannelContent(data)}
      </div>
    </div>
  );
};

export default HumanDesignModal;
