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
import { getRulerFromSign } from '../../../utils/astrologyUtils';

interface HouseRow {
  number: number;
  sign: string;
  cuspDegree: string;
  planetsInHouse: string;
}

export type { HouseRow };

const HouseTable: React.FC<{ data: HouseRow[] }> = ({ data }) => {
  if (!Array.isArray(data) || data.length === 0) return null;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>House</TableHead>
          <TableHead>Sign</TableHead>
          <TableHead>Cusp Degree</TableHead>
          <TableHead>Ruler</TableHead>
          <TableHead>Planets</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => {
          const ruler = (() => {
            try {
              return getRulerFromSign(
                item.sign.toLowerCase() as
                  | 'aries'
                  | 'taurus'
                  | 'gemini'
                  | 'cancer'
                  | 'leo'
                  | 'virgo'
                  | 'libra'
                  | 'scorpio'
                  | 'sagittarius'
                  | 'capricorn'
                  | 'aquarius'
                  | 'pisces'
              );
            } catch {
              return 'Unknown';
            }
          })();

          return (
            <TableRow key={`house-${item.number}-${index}`}>
              <TableCell className='font-medium'>{item.number}</TableCell>
              <TableCell>
                <div className='flex items-center gap-2'>
                  <span
                    className='text-xl text-cosmic-gold font-mono'
                    title={item.sign}
                  >
                    {getSignSymbol(item.sign)}
                  </span>
                  <span className='capitalize'>{item.sign}</span>
                </div>
              </TableCell>
              <TableCell>{item.cuspDegree}°</TableCell>
              <TableCell>
                <div className='flex items-center gap-2'>
                  <AstroSymbol
                    symbol={getPlanetSymbol(ruler)}
                    size='md'
                    title={ruler}
                    className='text-cosmic-gold'
                  />
                  <span className='capitalize'>{ruler}</span>
                </div>
              </TableCell>
              <TableCell>
                <span
                  className={
                    item.planetsInHouse === 'None'
                      ? 'text-cosmic-silver opacity-60'
                      : 'text-cosmic-gold'
                  }
                >
                  {item.planetsInHouse}
                </span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default memo(HouseTable);
