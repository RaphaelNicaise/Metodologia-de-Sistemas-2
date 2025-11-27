import SortIndicator from "./SortIndicator";

interface Props<T extends string> {
  label: string;
  property: T;
  isActive: boolean;
  direction: 'asc' | 'desc';
  onSort: (property: T) => void;
}

const SortableHeader = <T extends string>({
  label,
  property,
  isActive,
  direction,
  onSort
}: Props<T>) => {
  return (
    <th onClick={() => onSort(property)} style={{ cursor: 'pointer' }}>
      <div className="sortable-header-content">
        {label}
        <SortIndicator isActive={isActive} direction={direction} />
      </div>
    </th>
  );
};

export default SortableHeader;
