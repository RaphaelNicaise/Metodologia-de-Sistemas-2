export interface Expense {
    id: number;
    description: string;
    category: string;
    amount: number;
    expense_date: string; 
    user_id: number;
    notes?: string;
}

export interface DeleteResponse {
    success: boolean;
    message?: string;
}

// Ya tienes un CreateGastoData en 'accountingService.ts', 
// pero podemos definirlo aquí para mantener todo centralizado.
export type CreateExpenseData = Omit<Expense, 'id'>;

// Tipo para la actualización (todos los campos son opcionales)
export type UpdateExpenseData = Partial<CreateExpenseData>;