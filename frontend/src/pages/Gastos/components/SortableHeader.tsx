import SortIndicator from "./SortIndicator"; // <-- ¡ESTA ES LA LÍNEA CORREGIDA!
import type { Expense } from "../../../types/Expense";


type ExpenseSortKey = keyof Pick<Expense, 'description' | 'category' | 'amount' | 'expense_date'>;
type SortDirection = 'asc' | 'desc';

interface Props {
    label: string;
    property: ExpenseSortKey;
    isActive: boolean;
    direction: SortDirection;
    onSort: (property: ExpenseSortKey) => void;
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