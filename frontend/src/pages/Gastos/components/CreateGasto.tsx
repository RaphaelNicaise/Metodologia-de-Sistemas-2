import React, { useState } from "react";
import {
    Modal,
    Button,
    Form,
    Row,
    Col,
    Alert,
    Spinner,
} from 'react-bootstrap';
import useCreateGasto from "../../../hooks/useCreateGasto";
import type { CreateExpenseData, Expense } from "../../../types/Expense"; 

interface Props {
    onClose: () => void;
    onExpenseCreated: (newExpense: Expense) => void;
}

interface FormDataState {
    description: string;
    category: string;
    amount: string;
    expense_date: string;
    notes: string;
}

const categories: string[] = [
    'proveedores', 'utilitarios', 'impuestos', 'salarios', 'alquiler', 'mantenimiento', 'otros'
];

const CreateGasto = ({ onClose, onExpenseCreated }: Props) => {
    const { createGasto, loading, error } = useCreateGasto();
    const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD

    const initialFormData: FormDataState = {
        description: '',
        category: 'otros',
        amount: '',
        expense_date: today,
        notes: '',
    };

    const [formData, setFormData] = useState<FormDataState>(initialFormData);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const name = e.target.name as keyof (typeof formData); 
        const value = e.target.value;

        setFormData(prev => ({
            ...prev,
            [name]: value 
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const USER_ID = 1;

            const expenseDataToSubmit: CreateExpenseData = {
                description: formData.description,
                category: formData.category,
                amount: parseFloat(formData.amount),
                expense_date: formData.expense_date,
                user_id: USER_ID,
                notes: formData.notes
            };

            const newExpense = await createGasto(expenseDataToSubmit);
            setFormData(initialFormData);
            onExpenseCreated(newExpense); 

        } catch (error) {
            console.error('Error al crear gasto:', error);
        }
    };

    return (
        <Modal
            show={true}
            onHide={onClose}
            size="lg"
            centered
            backdrop="static"
            keyboard={false}
        >
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton={!loading}>
                    <Modal.Title as="h2">Cargar Gasto</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {error && (
                        <Alert variant="danger">
                            Error al crear gasto: {error}
                        </Alert>
                    )}

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="formGastoDesc">
                                <Form.Label>
                                    Descripción <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="description"
                                    placeholder="Ej: Pago factura de luz, Compra de..."
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    disabled={loading}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formGastoAmount">
                                <Form.Label>
                                    Monto <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="number"
                                    name="amount"
                                    placeholder="Ej: 15000"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    required
                                    disabled={loading}
                                    step="0.01"
                                    min="0.01" 
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="formGastoCategory">
                                <Form.Label>
                                    Categoría <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    required
                                    disabled={loading}
                                >
                                    {categories.map((category, index) => (
                                        <option key={index} value={category}>
                                            {category.charAt(0).toUpperCase() + category.slice(1)}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formGastoDate">
                                <Form.Label>
                                    Fecha del Gasto <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="date"
                                    name="expense_date"
                                    value={formData.expense_date}
                                    onChange={handleInputChange}
                                    required
                                    disabled={loading}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <Form.Group className="mb-3" controlId="formGastoNotes">
                                <Form.Label>Notas (Importante)</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="notes"
                                    placeholder="Añade 'CAJA' o 'EFECTIVO' si este gasto salió de la caja física."
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                />
                                <Form.Text muted>
                                    Para que el gasto se descuente del Balance de Caja,
                                    incluye la palabra "CAJA" o "EFECTIVO" en las notas.
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>

                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="danger"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="success"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                />
                                Creando...
                            </>
                        ) : (
                            'Crear Gasto'
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default CreateGasto;