// frontend/src/hooks/useCreateGasto.ts
import { useState } from "react";
import { createExpenseApi } from "../api/accountingService";
import type { CreateExpenseData } from "../types/Expense";

const useCreateGasto = () => {
    const [data, setData] = useState<Awaited<ReturnType<typeof createExpenseApi>> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createGasto = async (expenseData: CreateExpenseData) => {
        setLoading(true);
        setError(null);
        const amount = expenseData.amount;
        if (isNaN(amount) || amount <= 0) {
        setError("El monto debe ser un número mayor a cero.");
        setLoading(false);
        // Lanzamos un error para detener la ejecución
        throw new Error("El monto debe ser un número mayor a cero.");
        }
        try {
            const data = await createExpenseApi(expenseData);
            setData(data);
            return data;

        } catch (err) {
            console.error("Error creating expense", err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Ocurrió un error desconocido al crear el gasto");
            }
            throw err;
        } finally {
            setLoading(false);
        }
    }
    return { createGasto, loading, error, data };
}

export default useCreateGasto;