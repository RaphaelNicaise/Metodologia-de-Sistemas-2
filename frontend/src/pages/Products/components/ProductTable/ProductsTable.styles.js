import { styled } from '@mui/material/styles';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

// Estilos para las celdas de encabezado
export const StyledTableCell = styled(TableCell)(({ theme, hasrightborder = "false" }) => ({
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

// Estilos para las filas de la tabla
export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(even)': {
    backgroundColor: theme.palette.grey[50],
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
  transition: 'background-color 0.2s ease',
}));

// Estilo para celdas del cuerpo con bordes verticales
export const BodyTableCell = styled(TableCell)(({ theme, hasrightborder = "false" }) => ({
  padding: '12px',
  borderRight: hasrightborder === "true" ? '1px solid #e0e0e0' : 'none',
  position: 'relative',
}));