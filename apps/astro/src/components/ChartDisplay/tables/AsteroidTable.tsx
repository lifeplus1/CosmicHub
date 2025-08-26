import React, { memo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@cosmichub/ui';
import { getAsteroidSymbol, getSignSymbol } from './tableUtils';

export interface AsteroidRow {
  name: string;
  sign: string;
  degree: string;
  house: string;
}

const AsteroidTable: React.FC<{ data: AsteroidRow[] }> = ({ data }) => {
  if (!Array.isArray(data) || data.length === 0) return null;

  return (
    <Table aria-describedby='asteroid-table-caption'>
      <caption id='asteroid-table-caption' className='sr-only'>
        Table of asteroid and minor body positions with sign, degree and house
      </caption>
      <TableHeader>
        <TableRow>
          <TableHead>Asteroid</TableHead>
          <TableHead>Sign</TableHead>
          <TableHead>Degree</TableHead>
          <TableHead>House</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={`asteroid-${item.name}-${index}`}>
            <TableCell className='font-medium'>
              <span className='flex items-center gap-2'>
                <span className='text-cosmic-gold text-lg' title={item.name}>
                  {getAsteroidSymbol(item.name)}
                </span>
                <span>{item.name}</span>
              </span>
            </TableCell>
            <TableCell>
              <span className='flex items-center gap-2'>
                <span
                  className='text-xl text-cosmic-gold font-mono'
                  title={item.sign}
                >
                  {getSignSymbol(item.sign)}
                </span>
                <span>{item.sign}</span>
              </span>
            </TableCell>
            <TableCell>{item.degree}°</TableCell>
            <TableCell>{item.house}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default memo(AsteroidTable);
