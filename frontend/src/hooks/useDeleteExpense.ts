import { useState } from "react"
import { deleteExpenseApi } from "../api/accountingService";

const useDeleteExpense = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteExpense = async (expenseId: number) => {
        setLoading(true);
        setError(null);

        try {
            const result = await deleteExpenseApi(expenseId);
            return result;

        } catch (err) { 
            console.error("Error deleting expense", err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Ocurrió un error desconocido al eliminar");
            }
            throw err;
        } finally {
            setLoading(false);
        }
    }

    return { deleteExpense, loading, error };
}

export default useDeleteExpense;