import React, { memo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@cosmichub/ui';
import { getAspectSymbol, getPlanetSymbol } from './tableUtils';
import { AstroSymbol } from '../AstroSymbol';

// Enhanced aspect types including minor aspects
export type AspectType = 
  | 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile'  // Major
  | 'semisextile' | 'semisquare' | 'sesquiquadrate' | 'quincunx'  // Minor
  | 'quintile' | 'biquintile' | 'septile' | 'novile' | 'decile';   // Harmonic

export interface EnhancedAspect {
  planet1: string;
  planet2: string;
  aspect: string;
  aspectType: AspectType;
  orb: number;
  isMajor: boolean;
  strength: 'exact' | 'strong' | 'moderate' | 'weak';
  applying: boolean; // Is the aspect applying or separating
  angularDifference: number;
  interpretation?: string;
}

interface EnhancedAspectTableProps {
  aspects: EnhancedAspect[];
  includeMinorAspects: boolean;
  maxMajorOrb: number;
  maxMinorOrb: number;
}

// Aspect definitions with their degrees and harmonic significance
const ASPECT_DEFINITIONS: Record<AspectType, { degrees: number; harmonic: number; isHard: boolean }> = {
  conjunction: { degrees: 0, harmonic: 1, isHard: false },
  opposition: { degrees: 180, harmonic: 2, isHard: true },
  trine: { degrees: 120, harmonic: 3, isHard: false },
  square: { degrees: 90, harmonic: 4, isHard: true },
  sextile: { degrees: 60, harmonic: 6, isHard: false },
  semisextile: { degrees: 30, harmonic: 12, isHard: false },
  semisquare: { degrees: 45, harmonic: 8, isHard: true },
  sesquiquadrate: { degrees: 135, harmonic: 8, isHard: true },
  quincunx: { degrees: 150, harmonic: 12, isHard: true },
  quintile: { degrees: 72, harmonic: 5, isHard: false },
  biquintile: { degrees: 144, harmonic: 5, isHard: false },
  septile: { degrees: 51.43, harmonic: 7, isHard: false },
  novile: { degrees: 40, harmonic: 9, isHard: false },
  decile: { degrees: 36, harmonic: 10, isHard: false }
};

// Calculate aspect strength based on orb
const getAspectStrength = (orb: number, maxOrb: number): EnhancedAspect['strength'] => {
  const orbRatio = Math.abs(orb) / maxOrb;
  if (orbRatio <= 0.3) return 'exact';
  if (orbRatio <= 0.6) return 'strong';
  if (orbRatio <= 0.8) return 'moderate';
  return 'weak';
};

// Get aspect color based on type and strength
const getAspectColor = (aspect: EnhancedAspect): string => {
  const def = ASPECT_DEFINITIONS[aspect.aspectType];
  
  if (aspect.strength === 'exact') return 'text-red-600 font-bold';
  if (def.isHard) {
    return aspect.isMajor ? 'text-red-500' : 'text-orange-500';
  } else {
    return aspect.isMajor ? 'text-blue-500' : 'text-green-500';
  }
};

export const EnhancedAspectTable: React.FC<EnhancedAspectTableProps> = ({
  aspects,
  includeMinorAspects,
  maxMajorOrb,
  maxMinorOrb,
}) => {
  // Filter aspects based on settings
  const filteredAspects = aspects.filter(aspect => {
    if (!includeMinorAspects && !aspect.isMajor) return false;
    
    const maxOrb = aspect.isMajor ? maxMajorOrb : maxMinorOrb;
    return Math.abs(aspect.orb) <= maxOrb;
  });

  // Sort by strength and then by orb
  const sortedAspects = filteredAspects.sort((a, b) => {
    const strengthOrder = { exact: 0, strong: 1, moderate: 2, weak: 3 };
    const strengthDiff = strengthOrder[a.strength] - strengthOrder[b.strength];
    if (strengthDiff !== 0) return strengthDiff;
    return Math.abs(a.orb) - Math.abs(b.orb);
  });

  if (sortedAspects.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">🔍</div>
        <div>No aspects found with current settings</div>
        <div className="text-sm mt-1">
          Try adjusting orb settings or including minor aspects
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-aspect-table">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          ⚡ Enhanced Aspects ({sortedAspects.length})
        </h3>
        <div className="text-sm text-gray-600">
          Major: {sortedAspects.filter(a => a.isMajor).length} | 
          Minor: {sortedAspects.filter(a => !a.isMajor).length}
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Planets</TableHead>
              <TableHead>Aspect</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Orb</TableHead>
              <TableHead>Strength</TableHead>
              <TableHead>Motion</TableHead>
              <TableHead>Harmonic</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAspects.map((aspect, index) => {
              const aspectDef = ASPECT_DEFINITIONS[aspect.aspectType];
              const aspectColor = getAspectColor(aspect);
              
              return (
                <TableRow key={index} className={`${aspectColor} hover:bg-cosmic-dark/10`}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <AstroSymbol 
                        symbol={getPlanetSymbol(aspect.planet1)} 
                        size="sm"
                        title={aspect.planet1}
                      />
                      <span className="text-sm">{aspect.planet1}</span>
                      <span className="text-gray-400">-</span>
                      <AstroSymbol 
                        symbol={getPlanetSymbol(aspect.planet2)} 
                        size="sm"
                        title={aspect.planet2}
                      />
                      <span className="text-sm">{aspect.planet2}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <AstroSymbol 
                        symbol={getAspectSymbol(aspect.aspect)} 
                        size="md"
                        title={aspect.aspect}
                      />
                      <span className="text-sm">{aspect.aspect}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      aspect.isMajor 
                        ? 'bg-cosmic-purple/20 text-cosmic-purple border border-cosmic-purple/30' 
                        : 'bg-cosmic-gold/20 text-cosmic-gold border border-cosmic-gold/30'
                    }`}>
                      {aspect.isMajor ? 'Major' : 'Minor'}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-right">
                      <div className={`font-medium ${
                        Math.abs(aspect.orb) <= 1 ? 'text-red-600 font-bold' : ''
                      }`}>
                        {aspect.orb >= 0 ? '+' : ''}{aspect.orb.toFixed(2)}°
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        aspect.strength === 'exact' ? 'bg-cosmic-red shadow-cosmic-red/50 shadow-lg' :
                        aspect.strength === 'strong' ? 'bg-cosmic-gold shadow-cosmic-gold/50 shadow-lg' :
                        aspect.strength === 'moderate' ? 'bg-cosmic-purple shadow-cosmic-purple/50 shadow-lg' : 'bg-cosmic-silver/50'
                      }`} />
                      <span className="text-sm capitalize">{aspect.strength}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded ${
                      aspect.applying 
                        ? 'bg-cosmic-gold/20 text-cosmic-gold border border-cosmic-gold/30' 
                        : 'bg-cosmic-purple/20 text-cosmic-purple border border-cosmic-purple/30'
                    }`}>
                      {aspect.applying ? '→ Applying' : '← Separating'}
                    </span>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <div className="text-sm">
                      <div>H{aspectDef.harmonic}</div>
                      <div className="text-xs text-gray-500">
                        {aspectDef.degrees}°
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Aspect Statistics */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-cosmic-red/10 border border-cosmic-red/20 p-3 rounded-lg">
          <div className="font-medium text-cosmic-red">Exact Aspects</div>
          <div className="text-2xl font-bold text-cosmic-red">
            {sortedAspects.filter(a => a.strength === 'exact').length}
          </div>
        </div>
        
        <div className="bg-cosmic-purple/10 border border-cosmic-purple/20 p-3 rounded-lg">
          <div className="font-medium text-cosmic-purple">Hard Aspects</div>
          <div className="text-2xl font-bold text-cosmic-purple">
            {sortedAspects.filter(a => ASPECT_DEFINITIONS[a.aspectType].isHard).length}
          </div>
        </div>
        
        <div className="bg-cosmic-gold/10 border border-cosmic-gold/20 p-3 rounded-lg">
          <div className="font-medium text-cosmic-gold">Soft Aspects</div>
          <div className="text-2xl font-bold text-cosmic-gold">
            {sortedAspects.filter(a => !ASPECT_DEFINITIONS[a.aspectType].isHard).length}
          </div>
        </div>
        
        <div className="bg-cosmic-silver/10 border border-cosmic-silver/20 p-3 rounded-lg">
          <div className="font-medium text-cosmic-silver">Applying</div>
          <div className="text-2xl font-bold text-cosmic-silver">
            {sortedAspects.filter(a => a.applying).length}
          </div>
        </div>
      </div>

      {/* Professional Analysis Note */}
      <div className="mt-4 cosmic-glass border border-cosmic-purple/30 rounded-lg p-4">
        <div className="font-semibold text-cosmic-gold mb-2">🔬 Professional Analysis</div>
        <div className="text-sm text-cosmic-silver space-y-1">
          <div>• Aspects calculated with astronomical precision</div>
          <div>• Harmonic analysis showing deeper geometric relationships</div>
          <div>• Applying/Separating motion for timing insights</div>
          <div>• Customizable orbs for different aspect types</div>
        </div>
      </div>
    </div>
  );
};

export default memo(EnhancedAspectTable);
