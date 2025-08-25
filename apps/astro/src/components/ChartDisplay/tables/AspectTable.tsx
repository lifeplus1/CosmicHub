import React, { memo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@cosmichub/ui';
import { getPlanetSymbol, getAspectSymbol } from './tableUtils';

export interface AspectRow {
  planet1: string;
  planet2: string;
  type: string;
  orb: string;
  applying: string;
}

const AspectTable: React.FC<{ data: AspectRow[] }> = ({ data }) => {
  if (!Array.isArray(data) || data.length === 0) return null;
  return (
    <Table aria-describedby='aspect-table-caption'>
      <caption id='aspect-table-caption' className='sr-only'>
        Table of planetary aspects including aspect type, orb and
        applying/separating status
      </caption>
      <TableHeader>
        <TableRow>
          <TableHead>Planet 1</TableHead>
          <TableHead>Planet 2</TableHead>
          <TableHead>Aspect</TableHead>
          <TableHead>Orb</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={`aspect-${item.planet1}-${item.planet2}-${index}`}>
            <TableCell>
              <span className='flex items-center gap-2'>
                <span className='text-cosmic-gold text-xl' title={item.planet1}>
                  {getPlanetSymbol(item.planet1)}
                </span>
                <span>{item.planet1}</span>
              </span>
            </TableCell>
            <TableCell>
              <span className='flex items-center gap-2'>
                <span className='text-cosmic-gold text-xl' title={item.planet2}>
                  {getPlanetSymbol(item.planet2)}
                </span>
                <span>{item.planet2}</span>
              </span>
            </TableCell>
            <TableCell>
              <span className='flex items-center gap-2'>
                <span className='text-cosmic-gold text-xl' title={item.type}>
                  {getAspectSymbol(item.type)}
                </span>
                <span className='text-cosmic-gold font-medium'>
                  {item.type}
                </span>
              </span>
            </TableCell>
            <TableCell>{item.orb}°</TableCell>
            <TableCell>
              <span
                className={`font-medium ${
                  item.applying === 'Exact'
                    ? 'text-cosmic-gold'
                    : item.applying === 'Applying'
                      ? 'text-green-400'
                      : 'text-cosmic-silver'
                }`}
              >
                {item.applying}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default memo(AspectTable);
