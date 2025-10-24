import Box from '@mui/material/Box';
import { StyledTableCell } from './ProductsTable.styles';
import SortIndicator from './SortIndicator';

type ProductSortKey = 'name' | 'category' | 'price' | 'stock';

type SortDirection = 'asc' | 'desc';

interface Props {
  label: string;
  property: ProductSortKey;
  hasRightBorder: boolean;
  isActive: boolean;
  direction: SortDirection;
  onSort: (property: ProductSortKey) => void;
}

const SortableHeader = ({
  label,
  property,
  hasRightBorder,
  isActive,
  direction,
  onSort
}: Props) => {
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