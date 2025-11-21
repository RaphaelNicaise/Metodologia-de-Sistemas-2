// frontend/src/api/accountingService.ts

// CORRECCIÓN 1: Importamos DeleteResponse desde Expense, no desde Product
import type { Expense, CreateExpenseData, UpdateExpenseData ,DeleteResponse } from '../types/Expense';

const API_URL = "http://localhost:5000/api/contabilidad";
const CASH_CLOSURES_URL = "http://localhost:5000/api/contabilidad/cash_closures";

interface RawExpense extends Omit<Expense, 'amount'> {
  amount: string;
}

// ----- TIPOS DE DATOS (KPIs) -----
interface DailyReportSales {
  total_count: number;
  total_amount: number;
}

export interface DailyReportExpenses {
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
  final_balance: number;

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
  total_expenses: number;
  final_balance: number;

  sales_breakdown: { [key: string]: number };
  expenses_breakdown: { [key: string]: number };
  cash_expenses: number;
  other_expenses: number;
  pending_invoices: number;
  low_stock_products: number;
}

export interface ExpenseSummary {
  category: string;
  total_amount: number; 
}

// --- INTERFAZ CRUDA para ExpenseSummary ---
interface RawExpenseSummary {
  category: string;
  total_amount: string; 
}


// ----- FUNCIONES DE API (KPIs) -----
export const getDailyReportApi = async (): Promise<DailyReport> => {
  const res = await fetch(`${API_URL}/reports/daily`);
  if (!res.ok) {
    throw new Error(`Error http: ${res.status} ${res.statusText}`);
  }
  // Convertimos los 'amount' a número
  const data = await res.json() as DailyReport;
  return {
    ...data,
    sales: {
      ...data.sales,
      total_amount: Number(data.sales.total_amount)
    },
    expenses: {
      ...data.expenses,
      cash_expenses: Number(data.expenses.cash_expenses),
      other_expenses: Number(data.expenses.other_expenses)
    },
    cash_balance: Number(data.cash_balance)
  };
};

export const getMonthlyComparisonApi = async (): Promise<MonthlyComparison> => {
  const res = await fetch(`${API_URL}/reports/comparison?type=monthly`);
  if (!res.ok) {
    throw new Error(`Error http: ${res.status} ${res.statusText}`);
  }
  // Convertimos los 'amount' a número
  const data = await res.json() as MonthlyComparison;
  return {
    ...data,
    current: {
      ...data.current,
      data: { total_revenue: Number(data.current.data.total_revenue) }
    },
    previous: {
      ...data.previous,
      data: { total_revenue: Number(data.previous.data.total_revenue) }
    }
  };
};

export const getVentasSemanalesApi = async (): Promise<VentasSemanales> => {
  const res = await fetch(`${API_URL}/reports/quick-stats/week`);
  if (!res.ok) {
    throw new Error(`Error http: ${res.status} ${res.statusText}`);
  }
  const data = await res.json() as VentasSemanales;
  //Convertimos los 'amount' a número
  return {
    ...data,
    total_amount: Number(data.total_amount),
    daily_breakdown: data.daily_breakdown.map(day => ({
      ...day,
      total: Number(day.total)
    }))
  };
};

export const getCustomerInsightsApi = async (): Promise<CustomerInsights> => {
  const res = await fetch(`${API_URL}/reports/customers/insights`);
  if (!res.ok) {
    throw new Error(`Error http: ${res.status} ${res.statusText}`);
  }
  const data = await res.json() as CustomerInsights;
  // Convertimos los 'amount' a número
  return {
    ...data,
    payment_preferences: data.payment_preferences.map(pref => ({
      ...pref,
      total: Number(pref.total)
    })),
    hourly_activity: data.hourly_activity.map(hour => ({
      ...hour,
      avg_amount: Number(hour.avg_amount)
    }))
  };
};

export const getTodayPreviewApi = async (): Promise<DailyPreview> => {
  const res = await fetch(`${CASH_CLOSURES_URL}/today-preview`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Error http: ${res.status}`);
  }
  // Convertimos todos los montos a número
  return {
    ...data,
    total_sales: Number(data.total_sales),
    cash_expenses: Number(data.cash_expenses),
    final_balance: Number(data.final_balance),
    other_expenses: Number(data.other_expenses),
    // También convertimos los breakdowns
    sales_breakdown: Object.fromEntries(
      Object.entries(data.sales_breakdown).map(([key, value]) => [key, Number(value)])
    ),
    expenses_breakdown: Object.fromEntries(
      Object.entries(data.expenses_breakdown).map(([key, value]) => [key, Number(value)])
    )
  } as DailyPreview;
};

export const postCloseTodayApi = async (userId: number): Promise<CloseDayResponse> => {
  const res = await fetch(`${CASH_CLOSURES_URL}/close-today`, {
    method: "POST",
    headers: { 'Accept': 'application/json', 'Content-type': 'application/json' },
    body: JSON.stringify({ user_id: userId })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Error http: ${res.status}`);
  }
  // Convertimos todos los montos a número
  return {
    ...data,
    total_sales: Number(data.total_sales),
    total_expenses: Number(data.total_expenses),
    final_balance: Number(data.final_balance),
    cash_expenses: Number(data.cash_expenses),
    other_expenses: Number(data.other_expenses),
    sales_breakdown: Object.fromEntries(
      Object.entries(data.sales_breakdown).map(([key, value]) => [key, Number(value)])
    ),
    expenses_breakdown: Object.fromEntries(
      Object.entries(data.expenses_breakdown).map(([key, value]) => [key, Number(value)])
    )
  } as CloseDayResponse;
};

export const getExpenseSummaryApi = async (): Promise<ExpenseSummary[]> => {
  const res = await fetch(`${API_URL}/expenses/summary/category`);
  if (!res.ok) {
    throw new Error(`Error http: ${res.status} ${res.statusText}`);
  }
  // Convertimos 'amount' a número
  const data = await res.json() as RawExpenseSummary[];
  return data.map(summary => ({
    ...summary,
    total_amount: Number(summary.total_amount)
  }));
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

  const data = await res.json() as RawExpense;

  if (!res.ok) {
    throw new Error(`Error http: ${res.status} ${res.statusText}`);
  }
  return {
    ...data,
    amount: Number(data.amount)
  };
};


/**
 * Obtiene todos los gastos
 * Endpoint: GET /api/contabilidad/expenses/
 */
export const getExpensesApi = async (): Promise<Expense[]> => {
  const res = await fetch(`${API_URL}/expenses/`);
  if (!res.ok) {
    throw new Error(`Error http: ${res.status} ${res.statusText}`);
  }

  // Convertimos 'amount' de string a number
  const data = await res.json() as RawExpense[];
  const parsedData: Expense[] = data.map(expense => ({
    ...expense,
    amount: Number(expense.amount) 
  }));

  return parsedData || [];
};

/**
 * Actualiza un gasto existente
 * Endpoint: PUT /api/contabilidad/expenses/:id
 */
export const updateExpenseApi = async (
    expenseId: number, 
    expenseData: UpdateExpenseData
): Promise<Expense> => {
    const res = await fetch(`${API_URL}/expenses/${expenseId}`, {
        method: "PUT",
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json',
        },
        body: JSON.stringify(expenseData)
    });

    const data = await res.json() as RawExpense; 

    if (!res.ok) {
    throw new Error(`Error http: ${res.status} ${res.statusText}`);
  }

    // Convertimos el 'amount' a número antes de devolverlo
    return {
        ...data,
        amount: Number(data.amount) 
    };
};


/**
 * Elimina un gasto por ID
 * Endpoint: DELETE /api/contabilidad/expenses/:id
 */
export const deleteExpenseApi = async (expenseId: number): Promise<DeleteResponse> => {
  if (!expenseId) {
    const errorMsg = "Se requiere el ID del gasto para eliminarlo";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  const res = await fetch(`${API_URL}/expenses/${expenseId}`, {
    method: "DELETE",
    headers: {
      'Accept': 'application/json',
    }
  });

  if (!res.ok) {
    throw new Error(`Error http: ${res.status} ${res.statusText}`);
  }

  return { success: true };
};