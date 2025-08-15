import React from 'react';

export interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export interface TableRowProps {
  children: React.ReactNode;
  className?: string;
}

export interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
}

export interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className = '' }) => (
  <table className={`w-full border-collapse ${className}`}>
    {children}
  </table>
);

export const TableHeader: React.FC<TableHeaderProps> = ({ children, className = '' }) => (
  <thead className={`border-b ${className}`}>
    {children}
  </thead>
);

export const TableBody: React.FC<TableBodyProps> = ({ children, className = '' }) => (
  <tbody className={className}>
    {children}
  </tbody>
);

export const TableRow: React.FC<TableRowProps> = ({ children, className = '' }) => (
  <tr className={`border-b hover:bg-gray-50 ${className}`}>
    {children}
  </tr>
);

export const TableHead: React.FC<TableHeadProps> = ({ children, className = '' }) => (
  <th className={`text-left p-3 font-medium ${className}`}>
    {children}
  </th>
);

export const TableCell: React.FC<TableCellProps> = ({ children, className = '' }) => (
  <td className={`p-3 ${className}`}>
    {children}
  </td>
);
