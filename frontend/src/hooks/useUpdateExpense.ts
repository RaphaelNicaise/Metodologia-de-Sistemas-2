import { useState } from "react";
import { updateExpenseApi } from "../api/accountingService";
import type { UpdateExpenseData } from "../types/Expense";

const useUpdateExpense = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateExpense = async (expenseId: number, expenseData: UpdateExpenseData) => {
        setLoading(true);
        setError(null);

        // Validar el monto si se está actualizando
        if (expenseData.amount !== undefined) {
            const amount = Number(expenseData.amount);
            if (isNaN(amount) || amount <= 0) {
                const errMsg = "El monto debe ser un número mayor a cero.";
                setError(errMsg);
                setLoading(false);
                throw new Error(errMsg);
            }
        }

        try {
            const data = await updateExpenseApi(expenseId, expenseData);
            return data;

        } catch (err) {
            console.error("Error updating expense", err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Ocurrió un error desconocido al actualizar el gasto");
            }
            throw err;
        } finally {
            setLoading(false);
        }
    }

    return { updateExpense, loading, error };
}

export default useUpdateExpense;