from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.transaction import Transaction
from app.services.categorizer import categorize_transaction
from app.services.transaction_type import detect_transaction_type


router = APIRouter(
    prefix="/api/reprocess",
    tags=["Data Maintenance"]
)


@router.post("/")
def reprocess_transactions(
    db: Session = Depends(get_db)
):
    transactions = (
        db.query(Transaction)
        .all()
    )

    updated_count = 0

    for transaction in transactions:

        # Re-detect transaction type
        transaction.transaction_type = (
            detect_transaction_type(
                transaction.description
            )
        )

        # Re-detect category
        transaction.category = (
            categorize_transaction(
                transaction.description
            )
        )

        updated_count += 1

    db.commit()

    return {
        "status": "success",
        "message": "Existing transactions reprocessed successfully.",
        "transactions_updated": updated_count
    }