from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.transaction import Transaction


router = APIRouter(
    prefix="/api/delete-upload",
    tags=["Delete Upload"]
)


@router.delete("/")
def delete_uploaded_transactions(
    filename: str,
    db: Session = Depends(get_db)
):
    # Find transactions imported from this CSV
    transactions = (
        db.query(Transaction)
        .filter(Transaction.source == filename)
        .all()
    )

    if not transactions:
        raise HTTPException(
            status_code=404,
            detail=f"No transactions found for file: {filename}"
        )

    deleted_count = len(transactions)

    # Delete all transactions from this CSV
    db.query(Transaction).filter(
        Transaction.source == filename
    ).delete(
        synchronize_session=False
    )

    db.commit()

    return {
        "status": "success",
        "message": f"Transactions imported from '{filename}' were deleted.",
        "filename": filename,
        "transactions_deleted": deleted_count
    }