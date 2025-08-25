import React, { memo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@cosmichub/ui';

export interface HouseRow {
  number: number;
  sign: string;
  cuspDegree: string;
  planetsInHouse: string;
}

const HouseTable: React.FC<{ data: HouseRow[] }> = ({ data }) => {
  if (!Array.isArray(data) || data.length === 0) return null;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>House</TableHead>
          <TableHead>Sign</TableHead>
          <TableHead>Cusp Degree</TableHead>
          <TableHead>Planets</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={`house-${item.number}-${index}`}>
            <TableCell className='font-medium'>{item.number}</TableCell>
            <TableCell>{item.sign}</TableCell>
            <TableCell>{item.cuspDegree}°</TableCell>
            <TableCell>
              {typeof item.planetsInHouse === 'string' &&
              item.planetsInHouse.length > 0
                ? item.planetsInHouse
                : 'None'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default memo(HouseTable);
