import { styled } from '@mui/material/styles';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

interface StyledCellProps {
  hasrightborder?: string;
}

export const StyledTableCell = styled(TableCell)<StyledCellProps>(({ theme, hasrightborder = "false" }) => ({
  fontWeight: 'bold',
  cursor: 'pointer',
  padding: '16px 12px',
  borderBottom: '2px solid',
  borderBottomColor: theme.palette.divider,
  borderRight: hasrightborder === "true" ? '1px solid #e0e0e0' : 'none',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  transition: 'background-color 0.2s ease',
  position: 'relative',
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(even)': {
    backgroundColor: theme.palette.grey[50],
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
  transition: 'background-color 0.2s ease',
}));

export const BodyTableCell = styled(TableCell)<StyledCellProps>(({ theme, hasrightborder = "false" }) => ({
  padding: '12px',
  borderRight: hasrightborder === "true" ? '1px solid #e0e0e0' : 'none',
  position: 'relative',
}));