# src/accounting/models/cash_closures.py

class CashClosure:
    def __init__(self, id=None, closure_date=None, user_id=None, total_sales=None, 
                total_expenses=None, final_balance=None):
        self.id = id
        self.closure_date = closure_date
        self.user_id = user_id
        self.total_sales = total_sales
        self.total_expenses = total_expenses  # Solo gastos que afectan caja física
        self.final_balance = final_balance

    def __repr__(self):
        return (
            f"CashClosure(id={self.id}, closure_date={self.closure_date}, "
            f"user_id={self.user_id}, total_sales={self.total_sales}, "
            f"total_expenses={self.total_expenses}, final_balance={self.final_balance})"
        )

    def to_dict(self):
        return {
            "id": self.id,
            "closure_date": self.closure_date,
            "user_id": self.user_id,
            "total_sales": self.total_sales,
            "total_expenses": self.total_expenses,
            "final_balance": self.final_balance
        }

    @classmethod
    def from_dict(cls, data):
        return cls(
            id=data.get("id"),
            closure_date=data.get("closure_date"),
            user_id=data.get("user_id"),
            total_sales=data.get("total_sales"),
            total_expenses=data.get("total_expenses"),
            final_balance=data.get("final_balance")
        )