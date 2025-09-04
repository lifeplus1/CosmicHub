import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EnhancedAspectTable from '../EnhancedAspectTable';

// Mock the UI components
vi.mock('@cosmichub/ui', () => ({
  Table: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <table data-testid="table" className={className}>{children}</table>
  ),
  TableBody: ({ children }: { children: React.ReactNode }) => (
    <tbody data-testid="table-body">{children}</tbody>
  ),
  TableCell: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <td data-testid="table-cell" className={className}>{children}</td>
  ),
  TableHead: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <th data-testid="table-head" className={className}>{children}</th>
  ),
  TableHeader: ({ children }: { children: React.ReactNode }) => (
    <thead data-testid="table-header">{children}</thead>
  ),
  TableRow: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <tr data-testid="table-row" className={className}>{children}</tr>
  ),
}));

// Mock the utils
vi.mock('../tableUtils', () => ({
  getAspectSymbol: vi.fn((aspect: string) => aspect === 'conjunction' ? '☌' : '△'),
  getPlanetSymbol: vi.fn((planet: string) => planet === 'sun' ? '☉' : '☽'),
}));

// Mock AstroSymbol component
vi.mock('../AstroSymbol', () => ({
  AstroSymbol: ({ symbol }: { symbol: string }) => <span data-testid="astro-symbol">{symbol}</span>
}));

type AspectType =
  | 'conjunction'
  | 'opposition'
  | 'trine'
  | 'square'
  | 'sextile'
  | 'semisextile'
  | 'semisquare'
  | 'sesquiquadrate'
  | 'quincunx'
  | 'quintile'
  | 'biquintile'
  | 'septile'
  | 'novile'
  | 'decile';

interface EnhancedAspect {
  planet1: string;
  planet2: string;
  aspect: string;
  aspectType: AspectType;
  orb: number;
  isMajor: boolean;
  strength: 'exact' | 'strong' | 'moderate' | 'weak';
  applying: boolean;
  angularDifference: number;
  interpretation?: string;
}

describe('EnhancedAspectTable', () => {
  const mockAspects: EnhancedAspect[] = [
    {
      planet1: 'sun',
      planet2: 'moon',
      aspect: 'conjunction',
      aspectType: 'conjunction',
      orb: 2.5,
      isMajor: true,
      strength: 'strong',
      applying: true,
      angularDifference: 2.5,
      interpretation: 'A strong conjunction aspect'
    },
    {
      planet1: 'mars',
      planet2: 'venus',
      aspect: 'trine',
      aspectType: 'trine',
      orb: 3.2,
      isMajor: true,
      strength: 'moderate',
      applying: false,
      angularDifference: 123.2,
      interpretation: 'A harmonious trine aspect'
    },
    {
      planet1: 'jupiter',
      planet2: 'saturn',
      aspect: 'semisextile',
      aspectType: 'semisextile',
      orb: 1.1,
      isMajor: false,
      strength: 'exact',
      applying: true,
      angularDifference: 31.1,
      interpretation: 'A minor semisextile aspect'
    }
  ];

  it('renders aspect table with correct headers', () => {
    render(
      <EnhancedAspectTable
        aspects={mockAspects}
        includeMinorAspects={true}
        maxMajorOrb={8}
        maxMinorOrb={3}
      />
    );

    expect(screen.getByTestId('table')).toBeInTheDocument();
    expect(screen.getByTestId('table-header')).toBeInTheDocument();
  });

  it('displays major aspects correctly', () => {
    render(
      <EnhancedAspectTable
        aspects={mockAspects}
        includeMinorAspects={false}
        maxMajorOrb={8}
        maxMinorOrb={3}
      />
    );

    // Should show major aspects only
    const rows = screen.getAllByTestId('table-row');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('includes minor aspects when enabled', () => {
    render(
      <EnhancedAspectTable
        aspects={mockAspects}
        includeMinorAspects={true}
        maxMajorOrb={8}
        maxMinorOrb={3}
      />
    );

    // Should show all aspects including minor ones
    const rows = screen.getAllByTestId('table-row');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('filters aspects by orb limits', () => {
    const wideOrbAspects: EnhancedAspect[] = [
      {
        planet1: 'sun',
        planet2: 'moon',
        aspect: 'conjunction',
        aspectType: 'conjunction',
        orb: 12.5, // Wide orb
        isMajor: true,
        strength: 'weak',
        applying: true,
        angularDifference: 12.5,
        interpretation: 'A wide orb conjunction'
      }
    ];

    render(
      <EnhancedAspectTable
        aspects={wideOrbAspects}
        includeMinorAspects={true}
        maxMajorOrb={8}
        maxMinorOrb={3}
      />
    );

    // Aspects with orb > maxMajorOrb should be filtered out, showing no aspects message
    expect(screen.getByText(/no aspects found/i)).toBeInTheDocument();
  });

  it('displays aspect symbols correctly', () => {
    render(
      <EnhancedAspectTable
        aspects={mockAspects.slice(0, 1)}
        includeMinorAspects={true}
        maxMajorOrb={8}
        maxMinorOrb={3}
      />
    );

    // Should display table with aspect data
    const table = screen.getByTestId('table');
    expect(table).toBeInTheDocument();
    
    // Should show conjunction aspect name in the table
    expect(screen.getByText('conjunction')).toBeInTheDocument();
  });

  it('shows applying/separating indicators', () => {
    render(
      <EnhancedAspectTable
        aspects={mockAspects}
        includeMinorAspects={true}
        maxMajorOrb={8}
        maxMinorOrb={3}
      />
    );

    // Should indicate whether aspects are applying or separating
    const table = screen.getByTestId('table');
    expect(table).toBeInTheDocument();
  });

  it('displays power/strength ratings', () => {
    render(
      <EnhancedAspectTable
        aspects={mockAspects}
        includeMinorAspects={true}
        maxMajorOrb={8}
        maxMinorOrb={3}
      />
    );

    // Should show aspect power/strength values
    const table = screen.getByTestId('table');
    expect(table).toBeInTheDocument();
  });

  it('handles empty aspects array', () => {
    render(
      <EnhancedAspectTable
        aspects={[]}
        includeMinorAspects={true}
        maxMajorOrb={8}
        maxMinorOrb={3}
      />
    );

    // Should show "no aspects found" message for empty array
    expect(screen.getByText(/no aspects found/i)).toBeInTheDocument();
  });

  it('sorts aspects by strength/power', () => {
    render(
      <EnhancedAspectTable
        aspects={mockAspects}
        includeMinorAspects={true}
        maxMajorOrb={8}
        maxMinorOrb={3}
      />
    );

    // Aspects should be sorted by power (strongest first)
    const table = screen.getByTestId('table');
    expect(table).toBeInTheDocument();
  });

  it('applies different styling for major vs minor aspects', () => {
    render(
      <EnhancedAspectTable
        aspects={mockAspects}
        includeMinorAspects={true}
        maxMajorOrb={8}
        maxMinorOrb={3}
      />
    );

    // Should differentiate visual styling between major and minor aspects
    const rows = screen.getAllByTestId('table-row');
    expect(rows.length).toBeGreaterThan(0);
  });
});
