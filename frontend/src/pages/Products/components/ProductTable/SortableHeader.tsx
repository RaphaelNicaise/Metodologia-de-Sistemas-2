import SortIndicator from './SortIndicator.tsx'; // Importamos la nueva versión

type ProductSortKey = 'name' | 'category' | 'price' | 'stock';
type SortDirection = 'asc' | 'desc';

interface Props {
  label: string;
  property: ProductSortKey;
  isActive: boolean;
  direction: SortDirection;
  onSort: (property: ProductSortKey) => void;
}

const SortableHeader = ({
  label,
  property,
  isActive,
  direction,
  onSort
}: Props) => {
  return (
    <th
      onClick={() => onSort(property)}
      className="sortable-header"
    >
      <div className="d-flex justify-content-between align-items-center">
        <span>{label}</span>
        <SortIndicator isActive={isActive} direction={direction} />
      </div>
    </th>
  );
};

export default SortableHeader;