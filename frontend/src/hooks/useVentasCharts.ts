// frontend/src/hooks/useVentasCharts.ts
import { useState, useEffect, useRef } from 'react';
import { getVentasSemanalesApi, getCustomerInsightsApi, getExpenseSummaryApi } from '../api/accountingService';
import type { VentasSemanales, CustomerInsights, ExpenseSummary } from '../api/accountingService';

interface VentasChartsData {
    ventasSemanales: VentasSemanales | null;
    customerInsights: CustomerInsights | null;
    expenseSummary: ExpenseSummary[] | null;
}

// Creamos un tipo para los errores individuales
export interface ChartErrors {
    ventas: string | null;
    insights: string | null;
    expenses: string | null;
}

export const useVentasCharts = () => {
    const [data, setData] = useState<VentasChartsData>({
        ventasSemanales: null,
        customerInsights: null,
        expenseSummary: null,
    });
    const [loading, setLoading] = useState(true);
    
    // Un estado de error para CADA gráfico
    const [errors, setErrors] = useState<ChartErrors>({
        ventas: null,
        insights: null,
        expenses: null,
    });

    const effectRan = useRef(false);

    useEffect(() => {
        if (effectRan.current === true) {
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setErrors({ ventas: null, insights: null, expenses: null });
            
            // Usamos Promise.allSettled para que un fallo no rompa todo
            const results = await Promise.allSettled([
                getVentasSemanalesApi(),
                getCustomerInsightsApi(),
                getExpenseSummaryApi()
            ]);

            // Creamos los nuevos estados
            const newData: VentasChartsData = {
                ventasSemanales: null,
                customerInsights: null,
                expenseSummary: null,
            };
            const newErrors: ChartErrors = {
                ventas: null,
                insights: null,
                expenses: null,
            };

            // 1. Revisar resultado de Ventas Semanales
            if (results[0].status === 'fulfilled') {
                newData.ventasSemanales = results[0].value;
            } else {
                console.error("Error getVentasSemanalesApi:", results[0].reason);
                newErrors.ventas = (results[0].reason as Error).message;
            }

            // 2. Revisar resultado de Customer Insights
            if (results[1].status === 'fulfilled') {
                newData.customerInsights = results[1].value;
            } else {
                console.error("Error getCustomerInsightsApi:", results[1].reason);
                newErrors.insights = (results[1].reason as Error).message;
            }

            // 3. Revisar resultado de Gastos
            if (results[2].status === 'fulfilled') {
                newData.expenseSummary = results[2].value;
            } else {
                console.error("Error getExpenseSummaryApi:", results[2].reason);
                newErrors.expenses = (results[2].reason as Error).message;
            }

            setData(newData);
            setErrors(newErrors);
            setLoading(false);
        };

        fetchData();

        return () => {
            effectRan.current = true;
        };
    }, []);

    // Devolvemos los datos y los errores por separado
    return { 
        data, 
        loading, 
        errors
    };
};