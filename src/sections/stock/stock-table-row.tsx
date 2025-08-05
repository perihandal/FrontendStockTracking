import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import type { StockCard } from './stock-card.types';


type StockTableRowProps = {
  row: StockCard;
  selected: boolean;
  onSelectRow: () => void;
};

export function StockTableRow({ row, selected, onSelectRow }: StockTableRowProps) {
  return (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onChange={onSelectRow} />
      </TableCell>
      <TableCell>{row.name}</TableCell>
      <TableCell>{row.code}</TableCell>
      <TableCell>{row.type}</TableCell>
      <TableCell>{row.unit}</TableCell>
      <TableCell>{row.tax}</TableCell>
      <TableCell>{row.isActive ? 'Aktif' : 'Pasif'}</TableCell>
      <TableCell>{row.company.name}</TableCell>
      <TableCell>{row.branch.name}</TableCell>
      <TableCell>{row.mainGroup.name}</TableCell>
      <TableCell>{row.subGroup?.name ?? '-'}</TableCell>
      <TableCell>{row.category?.name ?? '-'}</TableCell>
      <TableCell>{row.createUser.name}</TableCell>
      <TableCell>{new Date(row.createdDate).toLocaleDateString()}</TableCell>
    </TableRow>
  );
}