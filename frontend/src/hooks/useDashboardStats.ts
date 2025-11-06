import { useState, useEffect, useRef } from 'react'; // 1. Importa useRef
import { getDailyReportApi, getMonthlyComparisonApi } from '../api/accountingService';
import type { DailyReport, MonthlyComparison } from '../api/accountingService';

// Definimos la forma de nuestros datos del dashboard
interface DashboardStats {
    dailyReport: DailyReport | null;
    monthlyComparison: MonthlyComparison | null;
}

export const useDashboardStats = () => {
    // Estado para los datos
    const [data, setData] = useState<DashboardStats>({
        dailyReport: null,
        monthlyComparison: null,
    });

    // Estado para la carga
    const [loading, setLoading] = useState(true);

    // Estado para errores
    const [error, setError] = useState<string | null>(null);

    // 2. Ref para controlar la ejecución en StrictMode
    const effectRan = useRef(false);

    useEffect(() => {
        // 3. Comprobar si ya se ejecutó
        if (effectRan.current === true) {
            return; // Si ya corrió, no hacer nada
        }
        
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Hacemos las llamadas una por una (en serie) 
                const dailyData = await getDailyReportApi();
                const monthlyData = await getMonthlyComparisonApi();

                setData({
                    dailyReport: dailyData,
                    monthlyComparison: monthlyData
                });

            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('Ocurrió un error al cargar los datos del dashboard');
                }
                console.error(err); 
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // 4. Marcar como ejecutado al final
        return () => {
            effectRan.current = true;
        };
        
    }, []); // El array vacío [] asegura que esto se ejecute solo una vez

    return { data, loading, error };
};