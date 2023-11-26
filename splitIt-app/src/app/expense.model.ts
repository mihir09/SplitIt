export interface Expense {
    expenseName: string;
    payer: string;
    expenseDate: Date;
    description?: string;
    amount: number;
}