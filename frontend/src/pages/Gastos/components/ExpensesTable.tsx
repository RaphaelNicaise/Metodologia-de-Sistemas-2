import { useState, useMemo } from "react";
import { Table, Card, Button, Toast, ToastContainer, Alert } from 'react-bootstrap';
import { MdCancel } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import DeleteExpenseDialog from "./DeleteExpenseDialog";
import SortableHeader from "./SortableHeader";
import type { Expense } from "../../../types/Expense";
import useDeleteExpense from "../../../hooks/useDeleteExpense"; 
import './ExpensesTable.css'; 

interface Props {
    expenses: Expense[];
    onEdit: (id: number) => void;
    onExpenseDeleted: (id: number) => void; // Esta prop es llamada al borrar
}

type Order = 'asc' | 'desc';
type DeleteConfirmState = { id: number; description: string } | null;
type SnackbarState = {
    open: boolean;
    message: string;
    severity: 'success' | 'danger';
}
type ExpenseSortKey = 'description' | 'category' | 'amount' | 'expense_date';

const ExpensesTable = ({ expenses = [], onEdit, onExpenseDeleted }: Props) => {

    const [orderBy, setOrderBy] = useState<ExpenseSortKey>('expense_date'); 
    const [order, setOrder] = useState<Order>('desc');
    const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>(null);
    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        message: '',
        severity: 'success'
    });

    const { deleteExpense, loading } = useDeleteExpense();

    const handleSort = (property: ExpenseSortKey) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleDeleteClick = (expenseId: number, description: string) => {
        setDeleteConfirm({ id: expenseId, description: description });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;

        try {
            await deleteExpense(deleteConfirm.id);
            setSnackbar({
                open: true,
                message: `Gasto "${deleteConfirm.description}" eliminado correctamente`,
                severity: 'success'
            });
            
            // LLAMAMOS A LA FUNCIÓN DEL PADRE PARA ACTUALIZAR LA UI
            if (onExpenseDeleted) {
                onExpenseDeleted(deleteConfirm.id);
            }
            
            // window.location.reload(); // ELIMINAMOS ESTA LÍNEA

        } catch (err) {
            let message = "Error al eliminar el gasto";
            if (err instanceof Error) {
                message = `Error al eliminar el gasto: ${err.message}`;
            }
            setSnackbar({
                open: true,
                message: message,
                severity: 'danger'
            });
        } finally {
            setDeleteConfirm(null);
        }
    };

    const cancelDelete = () => {
        setDeleteConfirm(null);
    };

    const closeSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            // Ajustamos por zona horaria para evitar desfasaje de día
            const userTimezoneOffset = date.getTimezoneOffset() * 60000;
            return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    const sortedExpenses = useMemo(() => {
        return [...expenses].sort((a: Expense, b: Expense) => {
            const aValue = a[orderBy];
            const bValue = b[orderBy];

            if (orderBy === 'expense_date' && typeof aValue === 'string' && typeof bValue === 'string') {
                const dateA = new Date(aValue).getTime();
                const dateB = new Date(bValue).getTime();
                return order === 'asc' ? dateA - dateB : dateB - dateA;
            }
            
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                const aLower = aValue.toLowerCase();
                const bLower = bValue.toLowerCase();
                if (aLower < bLower) return order === 'asc' ? -1 : 1;
                if (aLower > bLower) return order === 'asc' ? 1 : -1;
                return 0;
            }

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                if (aValue < bValue) return order === 'asc' ? -1 : 1;
                if (aValue > bValue) return order === 'asc' ? 1 : -1;
                return 0;
            }
            
            return 0;
        });
    }, [expenses, orderBy, order]);

    return (
        <>
            <Card className="table-container shadow-sm">
                <Card.Body>
                    <Table striped bordered hover responsive className="expenses-table">
                        <thead>
                            <tr>
                                <SortableHeader
                                    label="Descripción"
                                    property="description"
                                    isActive={orderBy === 'description'}
                                    direction={order}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    label="Categoría"
                                    property="category"
                                    isActive={orderBy === 'category'}
                                    direction={order}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    label="Monto"
                                    property="amount"
                                    isActive={orderBy === 'amount'}
                                    direction={order}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    label="Fecha"
                                    property="expense_date"
                                    isActive={orderBy === 'expense_date'}
                                    direction={order}
                                    onSort={handleSort}
                                />
                                <th className="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedExpenses.map((gasto) => (
                                <tr key={gasto.id}>
                                    <td className="align-middle">{gasto.description}</td>
                                    <td className="align-middle">{gasto.category}</td>
                                    {/* AHORA ESTO FUNCIONARÁ PORQUE 'amount' ES UN NÚMERO */}
                                    <td className="align-middle">${gasto.amount.toFixed(2)}</td>
                                    <td className="align-middle">{formatDate(gasto.expense_date)}</td>
                                    <td className="align-middle">
                                        <div className="action-btn-container">
                                            <Button
                                                variant="link" 
                                                className={`action-btn btn-edit ${loading ? 'btn-disabled' : ''}`}
                                                onClick={() => onEdit && onEdit(gasto.id)}
                                                title={loading ? "Espere..." : "Editar gasto"}
                                                disabled={loading}
                                            >
                                                <FaEdit />
                                            </Button>
                                            <Button
                                                variant="link"
                                                className={`action-btn btn-erase ${loading ? 'btn-disabled' : ''}`}
                                                onClick={() => !loading && handleDeleteClick(gasto.id, gasto.description)}
                                                title={loading ? "Eliminando..." : "Eliminar gasto"}
                                                disabled={loading}
                                            >
                                                <MdCancel />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <DeleteExpenseDialog
                open={!!deleteConfirm}
                loading={loading}
                expenseDescription={deleteConfirm?.description}
                onClose={cancelDelete}
                onConfirm={confirmDelete}
            />
            
            <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 9999 }}>
                <Toast
                    show={snackbar.open}
                    onClose={closeSnackbar}
                    delay={6000}
                    autohide
                    bg={snackbar.severity === 'danger' ? 'danger' : snackbar.severity}
                >
                    <Alert
                        variant={snackbar.severity}
                        onClose={closeSnackbar}
                        dismissible
                        className="mb-0"
                    >
                        <Alert.Heading as="h6" className="mb-1">
                            {snackbar.severity === 'success' ? 'Éxito' : 'Error'}
                        </Alert.Heading>
                        {snackbar.message}
                    </Alert>
                </Toast>
            </ToastContainer>
        </>
    );
};

export default ExpensesTable;