import React from 'react';
import Box from '@mui/material/Box';
import { StyledTableCell } from './ProductsTable.styles'; 
import SortIndicator from './SortIndicator';

// Este componente recibe sus props y las pasa
const SortableHeader = ({ label, property, hasRightBorder, isActive, direction, onSort }) => {
  return (
    <StyledTableCell
      onClick={() => onSort(property)} 
      hasrightborder={hasRightBorder ? "true" : "false"}
    >
      <Box className="sortable-header-content">
        {label}
        <SortIndicator isActive={isActive} direction={direction} />
      </Box>
    </StyledTableCell>
  );
};

export default SortableHeader;