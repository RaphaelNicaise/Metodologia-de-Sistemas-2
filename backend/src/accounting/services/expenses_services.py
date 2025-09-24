from accounting.models.expenses import Expense
from db import Database

class ExpenseService:
    def __init__(self):
        self.db = Database()

    def get_all_expenses(self, limit=50, offset=0):
        query = """
        SELECT * FROM expenses
        ORDER BY expense_date DESC
        LIMIT %s OFFSET %s
        """
        results = self.db.execute(query, (limit, offset))
        return [Expense(**row) for row in results]

    def get_expense_by_id(self, expense_id):
        query = "SELECT * FROM expenses WHERE id = %s"
        cursor = self.db.execute(query, (expense_id,))
        row = cursor.fetchone()
        return Expense(**row) if row else None

    def create_expense(self, data):
        query = """
        INSERT INTO expenses (description, category, amount, expense_date, user_id)
        VALUES (%s, %s, %s, %s, %s)
        """
        params = (
            data.get("description"),
            data.get("category"),
            data.get("amount"),
            data.get("expense_date"),
            data.get("user_id"),
        )
        try:
            cursor = self.db.execute(query, params)
            expense_id = cursor.lastrowid
            return self.get_expense_by_id(expense_id)
        except Exception as e:
            print(f"Error creando gasto: {e}")
            return None

    def update_expense(self, expense_id, data):
        query = """
        UPDATE expenses
        SET description = %s, category = %s, amount = %s, expense_date = %s, user_id = %s
        WHERE id = %s
        """
        params = (
            data.get("description"),
            data.get("category"),
            data.get("amount"),
            data.get("expense_date"),
            data.get("user_id"),
            expense_id,
        )
        try:
            self.db.execute(query, params)
            return self.get_expense_by_id(expense_id)
        except Exception as e:
            print(f"Error actualizando gasto: {e}")
            return None

    def delete_expense(self, expense_id):
        query = "DELETE FROM expenses WHERE id = %s"
        try:
            self.db.execute(query, (expense_id,))
            return True
        except Exception as e:
            print(f"Error borrando gasto: {e}")
            return False

    def get_expenses_by_category(self, category):
        query = """
        SELECT * FROM expenses
        WHERE category = %s
        ORDER BY expense_date DESC
        """
        results = self.db.execute(query, (category,))
        return [Expense(**row) for row in results]

    def get_expenses_by_date_range(self, start_date, end_date):
        query = """
        SELECT * FROM expenses
        WHERE expense_date BETWEEN %s AND %s
        ORDER BY expense_date DESC
        """
        results = self.db.execute(query, (start_date, end_date))
        return [Expense(**row) for row in results]

    def get_expenses_summary_by_category(self):
        """Devuelve el total gastado por categoría"""
        query = """
        SELECT category, SUM(amount) as total_amount
        FROM expenses
        GROUP BY category
        ORDER BY total_amount DESC
        """
        results = self.db.execute(query)
        return [{"category": row["category"], "total_amount": row["total_amount"]} for row in results]

    def get_monthly_summary(self, year):
        """Devuelve el gasto total por mes de un año"""
        query = """
        SELECT MONTH(expense_date) AS month, SUM(amount) AS total_amount
        FROM expenses
        WHERE YEAR(expense_date) = %s
        GROUP BY MONTH(expense_date)
        ORDER BY month
        """
        results = self.db.execute(query, (year,))
        return [{"month": row["month"], "total_amount": row["total_amount"]} for row in results]
