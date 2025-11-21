import { useState } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import Header from "../../layouts/Header/Header";
import Navbar from "../../components/Navbar";
import { FaPlus } from "react-icons/fa6";

import useGetExpenses from "../../hooks/useGetExpenses";
import ExpensesTable from "./components/ExpensesTable";
import CreateGasto from "./components/CreateGasto";
import SearchInput from "../../components/common/SearchInput";

// --- NUEVAS IMPORTACIONES ---
import type { Expense } from "../../types/Expense";
import EditGasto from "./components/EditGasto"; // 1. Importar el nuevo modal

const Gastos = () => {
    const { expenses, loading, error, setExpenses } = useGetExpenses();
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
    
    // 2. Nuevo estado para manejar el modal de EDICIÓN
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

    const filteredExpenses = expenses.filter((expense) =>
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (id: number) => {
        // 3. Busca el gasto y lo pone en el estado para abrir el modal
        const expenseToEdit = expenses.find(exp => exp.id === id);
        if (expenseToEdit) {
            setEditingExpense(expenseToEdit);
        }
    };

    const handleExpenseDeleted = (deletedExpenseId: number) => {
        setExpenses(currentExpenses => 
            currentExpenses.filter(exp => exp.id !== deletedExpenseId)
        );
    };

    // 4. Nueva función para manejar la actualización desde el modal
    const handleExpenseUpdated = (updatedExpense: Expense) => {
        setExpenses(currentExpenses =>
            currentExpenses.map(exp => 
                exp.id === updatedExpense.id ? updatedExpense : exp
            )
        );
        setEditingExpense(null); // Cierra el modal de edición
    };

    return (
        <>
            <Header />

            <div className="d-flex">
                <Navbar />

                <Container fluid as="main" className="flex-grow-1 p-4">
                    <h1 className="product-page-title">Gestión de Gastos</h1>

                    <Row className="mb-3 align-items-center">
                        <Col md={6} lg={4}>
                            <SearchInput
                                onSearch={setSearchTerm}
                                placeholder="Buscar por descripción o categoría..."
                            />
                        </Col>

                        <Col md={6} lg={8} className="d-flex justify-content-end">
                            <Button
                                variant="success"
                                onClick={() => setIsCreateOpen(true)} // Cambiado de setIsOpen
                                className="d-flex align-items-center gap-2"
                            >
                                <FaPlus />
                                <span>Agregar Gasto</span>
                            </Button>
                        </Col>
                    </Row>

                    {/* --- RENDERIZADO DE TABLA --- */}
                    {loading && (
                        <div className="text-center p-5">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Cargando gastos...</span>
                            </Spinner>
                        </div>
                    )}
                    
                    {error && <Alert variant="danger">Error al cargar gastos: {error}</Alert>}

                    {!loading && !error && filteredExpenses.length > 0 && (
                        <ExpensesTable
                            expenses={filteredExpenses}
                            onEdit={handleEdit} // onEdit ahora funciona
                            onExpenseDeleted={handleExpenseDeleted}
                        />
                    )}

                    {!loading && !error && expenses.length === 0 && (
                        <Alert variant="info">
                            No hay gastos registrados
                            {searchTerm ? ` que coincidan con "${searchTerm}"` : ''}
                        </Alert>
                    )}
                    {/* --- FIN RENDERIZADO DE TABLA --- */}
                    
                </Container>

                {/* Modal para CREAR gasto */}
                {isCreateOpen && (
                    <CreateGasto 
                        onClose={() => setIsCreateOpen(false)} 
                        onExpenseCreated={(newExpense) => {
                            setExpenses(currentExpenses => [newExpense, ...currentExpenses]);
                            setIsCreateOpen(false);
                        }}
                    />
                )}

                {/* 5. Renderizado condicional del modal de EDICIÓN */}
                {editingExpense && (
                    <EditGasto
                        expenseToEdit={editingExpense}
                        onClose={() => setEditingExpense(null)}
                        onExpenseUpdated={handleExpenseUpdated}
                    />
                )}
            </div>
        </>
    );
};

export default Gastos;