import React, { memo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@cosmichub/ui';
import { getPlanetSymbol, getSignSymbol } from './tableUtils';
import { AstroSymbol } from '../AstroSymbol';

export interface AngleRow {
  name: string;
  sign: string;
  degree: string;
}

const AngleTable: React.FC<{ data: AngleRow[] }> = ({ data }) => {
  if (!Array.isArray(data) || data.length === 0) return null;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Angle</TableHead>
          <TableHead>Sign</TableHead>
          <TableHead>Degree</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={`angle-${item.name}-${index}`}>
            <TableCell className='font-medium'>
              <span className='flex items-center gap-2'>
                <AstroSymbol
                  symbol={getPlanetSymbol(item.name)}
                  size='md'
                  title={item.name}
                  className='text-cosmic-gold'
                />
                <span>{item.name}</span>
              </span>
            </TableCell>
            <TableCell>
              <span className='text-cosmic-gold font-medium flex items-center gap-2'>
                <AstroSymbol
                  symbol={getSignSymbol(item.sign)}
                  size='md'
                  title={item.sign}
                  className='text-cosmic-gold'
                />
                <span>{item.sign}</span>
              </span>
            </TableCell>
            <TableCell>{item.degree}°</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default memo(AngleTable);
