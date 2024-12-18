import React from 'react';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({ children, ...props }) => (
  <table {...props} className={`min-w-full divide-y divide-gray-200 ${props.className || ''}`}>
    {children}
  </table>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, ...props }) => (
  <thead {...props} className={`bg-gray-50 ${props.className || ''}`}>
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, ...props }) => (
  <tbody {...props} className={`bg-white divide-y divide-gray-200 ${props.className || ''}`}>
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ children, ...props }) => (
  <tr {...props}>{children}</tr>
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ children, ...props }) => (
  <th
    {...props}
    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${props.className || ''}`}
  >
    {children}
  </th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ children, ...props }) => (
  <td {...props} className={`px-6 py-4 whitespace-nowrap ${props.className || ''}`}>
    {children}
  </td>
);

