// frontend/src/hooks/useCierreCaja.ts
import { useState, useEffect, useRef } from 'react';
import { getTodayPreviewApi, postCloseTodayApi } from '../api/accountingService';
import type { DailyPreview, CloseDayResponse } from '../api/accountingService'; // <-- CloseDayResponse ahora SÍ se usa

type CierreStatus = "IDLE" | "LOADING" | "PREVIEW" | "CLOSED" | "ERROR";

export const useCierreCaja = () => {
    const [preview, setPreview] = useState<DailyPreview | null>(null);
    const [status, setStatus] = useState<CierreStatus>("IDLE");
    const [error, setError] = useState<string | null>(null);
    const effectRan = useRef(false);

    // 1. Cargar la vista previa (sin cambios)
    useEffect(() => {
        if (effectRan.current === true) return;
        
        const fetchPreview = async () => {
            setStatus("LOADING");
            setError(null);
            try {
                const data = await getTodayPreviewApi();
                setPreview(data);
                setStatus("PREVIEW");
            } catch (err) {
                if (err instanceof Error) {
                    if (err.message.includes("Ya existe un cierre")) {
                        setStatus("CLOSED");
                        // Si ya está cerrado, cargamos los datos del cierre
                        // (esto es una mejora, pero por ahora lo dejamos así)
                    } else {
                        setError(err.message);
                        setStatus("ERROR");
                    }
                } else {
                    setError("Error desconocido al cargar la vista previa.");
                    setStatus("ERROR");
                }
            }
        };

        fetchPreview();

        return () => { effectRan.current = true; };
    }, []);

    // 2. Función para ejecutar el cierre
    const ejecutarCierre = async () => {
        const USER_ID = 1; // Asumimos user_id: 1 (admin)

        setStatus("LOADING");
        setError(null);
        try {
            // 'result' es de tipo CloseDayResponse
            const result: CloseDayResponse = await postCloseTodayApi(USER_ID); 

            const finalPreviewState: DailyPreview = {
                closure_date: result.closure_date,
                can_close: false, // ¡El día YA está cerrado!
                total_sales: result.total_sales,
                cash_expenses: result.cash_expenses,
                final_balance: result.final_balance,
                sales_breakdown: result.sales_breakdown,
                expenses_breakdown: result.expenses_breakdown,
                other_expenses: result.other_expenses,
                pending_invoices: result.pending_invoices,
                low_stock_products: result.low_stock_products
            };
            
            setPreview(finalPreviewState); 
            setStatus("CLOSED");

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Error desconocido al cerrar la caja.");
            }
            setStatus("PREVIEW"); 
        }
    };

    return { preview, status, error, ejecutarCierre };
};