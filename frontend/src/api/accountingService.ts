const API_URL = "http://localhost:5000/api/contabilidad";

// ----- TIPOS DE DATOS -----
// (Basados en tu backend/src/accounting/services/reports_services.py)

interface DailyReportSales {
    total_count: number;
    total_amount: number;
}

interface DailyReportExpenses {
    cash_expenses: number; // Usaremos este
    other_expenses: number;
}

export interface DailyReport {
    date: string;
    sales: DailyReportSales;
    expenses: DailyReportExpenses;
    cash_balance: number; // Este es (ventas - gastos_caja)
}

export interface MonthlyComparison {
    type: 'monthly';
    current: {
        period: string;
        data: { total_revenue: number; };
    };
    previous: {
        period: string;
        data: { total_revenue: number; };
    };
}

// ----- FUNCIONES DE API -----

/**
 * Se Obtiene el reporte diario (Ventas, Gastos de Caja, Balance)
 * Endpoint: /api/contabilidad/reports/daily
 */
export const getDailyReportApi = async (): Promise<DailyReport> => {
    const res = await fetch(`${API_URL}/reports/daily`);
    if (!res.ok) {
        throw new Error(`Error http: ${res.status} ${res.statusText}`);
    }
    const data = await res.json() as DailyReport;
    return data;
};

/**
 * Se Obtiene la comparación de ingresos del mes actual vs. el anterior
 * Endpoint: /api/contabilidad/reports/comparison?type=monthly
 */
export const getMonthlyComparisonApi = async (): Promise<MonthlyComparison> => {
    const res = await fetch(`${API_URL}/reports/comparison?type=monthly`);
    if (!res.ok) {
        throw new Error(`Error http: ${res.status} ${res.statusText}`);
    }
    const data = await res.json() as MonthlyComparison;
    return data;
};