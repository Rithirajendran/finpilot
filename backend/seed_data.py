from datetime import date

from app.database import SessionLocal
from app.models.transaction import Transaction


def seed_transactions():
    db = SessionLocal()

    existing = db.query(Transaction).count()

    if existing > 0:
        print("Transactions already exist.")
        db.close()
        return

    transactions = [
        Transaction(
            date=date(2026, 9, 5),
            description="Swiggy",
            amount=450,
            transaction_type="expense",
            category="Food",
            source="demo"
        ),
        Transaction(
            date=date(2026, 9, 4),
            description="Netflix",
            amount=649,
            transaction_type="expense",
            category="Entertainment",
            source="demo"
        ),
        Transaction(
            date=date(2026, 9, 3),
            description="Uber",
            amount=280,
            transaction_type="expense",
            category="Transport",
            source="demo"
        ),
        Transaction(
            date=date(2026, 9, 2),
            description="Amazon",
            amount=1299,
            transaction_type="expense",
            category="Shopping",
            source="demo"
        ),
    ]

    db.add_all(transactions)
    db.commit()

    print("Demo transactions added successfully.")

    db.close()


if __name__ == "__main__":
    seed_transactions()