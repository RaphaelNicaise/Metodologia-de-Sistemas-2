# src/accounting/models/expenses.py

class Expense:
    def __init__(self, id=None, description=None, category=None, amount=None, expense_date=None, user_id=None, notes=None):
        self.id = id
        self.description = description
        self.category = category
        self.amount = amount
        self.expense_date = expense_date
        self.user_id = user_id
        self.notes = notes

    def __repr__(self):
        return (
            f"Expense(id={self.id}, description={self.description}, category={self.category}, "
            f"amount={self.amount}, expense_date={self.expense_date}, user_id={self.user_id}),notes={self.notes}" 
        )

    def to_dict(self):
        return {
            "id": self.id,
            "description": self.description,
            "category": self.category,
            "amount": self.amount,
            "expense_date": self.expense_date,
            "user_id": self.user_id,
            "notes": self.notes,
        }

    @classmethod
    def from_dict(cls, data):
        return cls(
            id=data.get("id"),
            description=data.get("description"),
            category=data.get("category"),
            amount=data.get("amount"),
            expense_date=data.get("expense_date"),
            user_id=data.get("user_id"),
            notes=data.get("notes"),
        )
