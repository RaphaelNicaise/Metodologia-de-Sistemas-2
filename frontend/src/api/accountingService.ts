const API_URL = "http://localhost:5000/api/contabilidad";
const CASH_CLOSURES_URL = "http://localhost:5000/api/contabilidad/cash_closures";

// ----- TIPOS DE DATOS (KPIs) -----
interface DailyReportSales {
  total_count: number;
  total_amount: number;
}

interface DailyReportExpenses {
  cash_expenses: number;
  other_expenses: number;
}

export interface DailyReport {
  date: string;
  sales: DailyReportSales;
  expenses: DailyReportExpenses;
  cash_balance: number;
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
export interface VentasSemanales {
  week_start: string;
  week_end: string;
  total_sales: number;
  total_amount: number;
  daily_breakdown: {
    date: string;
    count: number;
    total: number;
  }[];
}

export interface CustomerInsights {
  payment_preferences: {
    payment_method: string;
    count: number;
    total: number;
  }[];
  hourly_activity: {
    hour: number;
    sales_count: number;
    avg_amount: number;
  }[];
}

export interface DailyPreview {
  closure_date: string;
  can_close: boolean;
  
  total_sales: number;
  cash_expenses: number;
  final_balance: number; // Este es (ventas - gastos_caja)

  // Desgloses
  sales_breakdown: { [key: string]: number };
  expenses_breakdown: { [key: string]: number };
  
  // Stats adicionales
  other_expenses: number;
  pending_invoices: number;
  low_stock_products: number;
}

export interface CloseDayResponse {
  id: number;
  closure_date: string;
  user_id: number;
  total_sales: number;
  total_expenses: number; // Es el mismo valor que cash_expenses
  final_balance: number;
  
  // Campos que faltaban:
  sales_breakdown: { [key: string]: number };
  expenses_breakdown: { [key: string]: number };
  cash_expenses: number; // El backend lo manda (redundante, pero está)
  other_expenses: number;
  pending_invoices: number;
  low_stock_products: number;
}

export interface ExpenseSummary {
  category: string;
  total_amount: number;
}
export interface Expense {
  id: number;
  description: string;
  category: string;
  amount: number;
  expense_date: string; // Formato YYYY-MM-DD
  user_id: number;
  notes?: string; 
}

// Omitimos 'id' para la creación
export type CreateExpenseData = Omit<Expense, 'id'>;

// ----- FUNCIONES DE API (KPIs) -----

/**
 * Obtiene el reporte diario (Ventas, Gastos de Caja, Balance)
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
 * Obtiene la comparación de ingresos del mes actual vs. el anterior
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

// ----- NUEVAS FUNCIONES DE API (Gráficos) -----

/**
 * Obtiene el desglose de ventas de la última semana
 * Endpoint: /api/contabilidad/reports/quick-stats/week
 */
export const getVentasSemanalesApi = async (): Promise<VentasSemanales> => {
    const res = await fetch(`${API_URL}/reports/quick-stats/week`);
    if (!res.ok) {
        throw new Error(`Error http: ${res.status} ${res.statusText}`);
    }
    const data = await res.json() as VentasSemanales;
    return data;
};

/**
 * Obtiene preferencias de pago y actividad por hora
 * Endpoint: /api/contabilidad/reports/customers/insights
 */
export const getCustomerInsightsApi = async (): Promise<CustomerInsights> => {
    const res = await fetch(`${API_URL}/reports/customers/insights`);
    if (!res.ok) {
        throw new Error(`Error http: ${res.status} ${res.statusText}`);
    }
    const data = await res.json() as CustomerInsights;
    return data;
};

/**
 * Obtiene la vista previa del cierre del día actual.
 * Endpoint: /api/contabilidad/cash_closures/today-preview
 */
export const getTodayPreviewApi = async (): Promise<DailyPreview> => {
    const res = await fetch(`${CASH_CLOSURES_URL}/today-preview`);
    const data = await res.json();
    
    if (!res.ok) {
        // Si la API devuelve error (ej. 400 "Ya existe un cierre"),
        // lo lanzamos para que el hook lo capture.
        throw new Error(data.error || `Error http: ${res.status}`);
    }
    
    return data as DailyPreview;
};

/**
 * Ejecuta el cierre del día de hoy.
 * Endpoint: /api/contabilidad/cash_closures/close-today
 * NOTA: Asumimos 'user_id: 1' por ahora.
 */
export const postCloseTodayApi = async (userId: number): Promise<CloseDayResponse> => {
    const res = await fetch(`${CASH_CLOSURES_URL}/close-today`, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId })
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || `Error http: ${res.status}`);
    }

    return data as CloseDayResponse;
};

export const getExpenseSummaryApi = async (): Promise<ExpenseSummary[]> => {
    const res = await fetch(`${API_URL}/expenses/summary/category`);
    if (!res.ok) {
        throw new Error(`Error http: ${res.status} ${res.statusText}`);
    }
    const data = await res.json() as ExpenseSummary[];
    return data;
};

export const createExpenseApi = async (
    expenseData: CreateExpenseData
): Promise<Expense> => {

    const res = await fetch(`${API_URL}/expenses/`, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json',
        },
        body: JSON.stringify(expenseData)
    });
    const data = await res.json() as Expense;
    console.log(data);

    if (!res.ok) {
        throw new Error(`Error http: ${res.status} ${res.statusText}`);
    }
    return data;
};