import React, { memo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
} from '@cosmichub/ui';
import {
  getPlanetSymbol,
  getSignSymbol,
  getPlanetInterpretation,
} from './tableUtils';

export interface PlanetRow {
  name: string;
  sign: string;
  house: number;
  degree: string;
  position?: number;
  retrograde?: boolean;
}

const PlanetTable: React.FC<{ data: PlanetRow[] }> = ({ data }) => {
  if (!Array.isArray(data) || data.length === 0) return null;
  return (
    <Table aria-describedby='planet-table-caption'>
      <caption id='planet-table-caption' className='sr-only'>
        Table of planetary positions with sign, house and degree
      </caption>
      <TableHeader>
        <TableRow>
          <TableHead>Planet</TableHead>
          <TableHead>Sign</TableHead>
          <TableHead>House</TableHead>
          <TableHead>Degree</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={`planet-${item.name}-${index}`}>
            <TableCell className='font-medium'>
              <Tooltip content={getPlanetInterpretation(item.name, item.sign)}>
                <span className='cursor-help flex items-center gap-2'>
                  <span className='text-cosmic-gold text-xl' title={item.name}>
                    {getPlanetSymbol(item.name)}
                  </span>
                  <span>{item.name}</span>
                </span>
              </Tooltip>
            </TableCell>
            <TableCell>
              <Tooltip
                content={`${item.name} in ${item.sign}: ${getPlanetInterpretation(item.name, item.sign)}`}
              >
                <span className='cursor-help text-cosmic-gold font-medium flex items-center gap-2'>
                  <span
                    className='text-xl text-cosmic-gold font-mono'
                    title={item.sign}
                  >
                    {getSignSymbol(item.sign)}
                  </span>
                  <span>{item.sign}</span>
                </span>
              </Tooltip>
            </TableCell>
            <TableCell>{item.house}</TableCell>
            <TableCell>{item.degree}°</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default memo(PlanetTable);
