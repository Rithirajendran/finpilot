from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.transaction import Transaction

router = APIRouter(
    prefix="/api/cleanup",
    tags=["Data Cleanup"]
)


@router.post("/duplicates")
def remove_duplicate_transactions(
    db: Session = Depends(get_db)
):
    transactions = (
        db.query(Transaction)
        .order_by(Transaction.id.asc())
        .all()
    )

    seen = set()
    duplicate_ids = []

    for transaction in transactions:

        key = (
            str(transaction.date),
            transaction.description.strip().lower()
            if transaction.description
            else "",
            round(float(transaction.amount or 0), 2),
            transaction.transaction_type,
            transaction.category,
            transaction.source
        )

        if key in seen:
            duplicate_ids.append(transaction.id)
        else:
            seen.add(key)

    if duplicate_ids:

        db.query(Transaction).filter(
            Transaction.id.in_(duplicate_ids)
        ).delete(
            synchronize_session=False
        )

        db.commit()

    return {
        "status": "success",
        "message": "Duplicate transactions removed.",
        "duplicates_removed": len(duplicate_ids),
        "remaining_transactions": (
            db.query(Transaction).count()
        )
    }