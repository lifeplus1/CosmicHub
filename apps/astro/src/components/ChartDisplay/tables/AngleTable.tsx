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
                <span className='text-cosmic-gold text-xl' title={item.name}>
                  {getPlanetSymbol(item.name)}
                </span>
                <span>{item.name}</span>
              </span>
            </TableCell>
            <TableCell>
              <span className='text-cosmic-gold font-medium flex items-center gap-2'>
                <span className='text-lg' title={item.sign}>
                  {getSignSymbol(item.sign)}
                </span>
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
