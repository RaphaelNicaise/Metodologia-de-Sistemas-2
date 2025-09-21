import React, { useState, useMemo } from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

// Componente para los indicadores de ordenamiento
const SortIndicator = ({ isActive, direction }) => {
  return (
    <Box component="span" sx={{ 
      ml: 0.5, 
      color: isActive ? 'primary.main' : 'text.disabled',
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontSize: '0.8rem'
    }}>
      {isActive ? (
        direction === 'asc' ? 
          <span style={{ fontSize: '16px' }}>▲</span> : 
          <span style={{ fontSize: '16px' }}>▼</span>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          opacity: 0.4,
          lineHeight: 0.8
        }}>
          <span style={{ fontSize: '12px' }}>▲</span>
          <span style={{ fontSize: '12px', marginTop: '-3px' }}>▼</span>
        </Box>
      )}
    </Box>
  );
};

// Estilos personalizados para las celdas de encabezado
const StyledTableCell = styled(TableCell)(({ theme, hasrightborder = "false" }) => ({
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
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(even)': {
    backgroundColor: theme.palette.grey[50],
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
  transition: 'background-color 0.2s ease',
}));

// Estilo para celdas del cuerpo con bordes verticales
const BodyTableCell = styled(TableCell)(({ theme, hasrightborder = "false" }) => ({
  padding: '12px',
  borderRight: hasrightborder === "true" ? '1px solid #e0e0e0' : 'none',
  position: 'relative',
}));

const ProductsTable = ({ products = [] }) => {
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      // Para campos de texto (nombre, categoría)
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      // Para campos numéricos (precio, stock)
      if (orderBy === 'price' || orderBy === 'stock') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }

      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [products, orderBy, order]);

  // Componente para encabezados ordenables
  const SortableHeader = ({ label, property, hasRightBorder = false }) => {
    const isActive = orderBy === property;
    return (
      <StyledTableCell 
        onClick={() => handleSort(property)}
        hasrightborder={hasRightBorder ? "true" : "false"}
      >
        <Box display="flex" alignItems="center">
          {label}
          <SortIndicator isActive={isActive} direction={order} />
        </Box>
      </StyledTableCell>
    );
  };

  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        borderRadius: 1, 
        overflow: 'hidden',
        boxShadow: 2,
        border: '1px solid #e0e0e0'
      }}
    >
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <StyledTableCell hasrightborder="true">Imagen</StyledTableCell>
            <SortableHeader label="Nombre" property="name" hasRightBorder />
            <SortableHeader label="Categoría" property="category" hasRightBorder />
            <SortableHeader label="Precio" property="price" hasRightBorder />
            <SortableHeader label="Stock" property="stock" hasRightBorder />
            <StyledTableCell>Código de Barra</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedProducts.map(({ id, name, barcode, price, stock, url_image, category }) => {
            const imageToShow = url_image && url_image.length > 0
              ? url_image[0]
              : '/Image-not-found.png';
            return (
              <StyledTableRow key={id}>
                <BodyTableCell hasrightborder="true">
                  <img
                    src={imageToShow}
                    alt={name}
                    style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                  />
                </BodyTableCell>
                <BodyTableCell hasrightborder="true">{name}</BodyTableCell>
                <BodyTableCell hasrightborder="true">{category}</BodyTableCell>
                <BodyTableCell hasrightborder="true">${price}</BodyTableCell>
                <BodyTableCell hasrightborder="true">{stock}</BodyTableCell>
                <BodyTableCell>{barcode}</BodyTableCell>
              </StyledTableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProductsTable;