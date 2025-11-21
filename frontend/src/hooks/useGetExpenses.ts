import { useState, useEffect, useRef } from "react";
import { getExpensesApi } from "../api/accountingService";
import type { Expense } from "../types/Expense";

const useGetExpenses = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const effectRan = useRef(false);

    useEffect(() => {
        if (effectRan.current === true) {
            return;
        }

        const fetchExpenses = async () => {
            try {
                const data = await getExpensesApi();
                setExpenses(data);
            } catch (err) { 
                console.error("Error fetching expenses", err);
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Ocurrió un error desconocido al obtener los gastos");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchExpenses();

        return () => {
            effectRan.current = true;
        };
    }, []);

    return { expenses, loading, error, setExpenses }; 
}

export default useGetExpenses;