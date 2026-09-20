import io

import pandas as pd
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.transaction import Transaction
from app.services.categorizer import categorize_transaction
from app.services.transaction_type import detect_transaction_type


router = APIRouter(
    prefix="/api/upload",
    tags=["Upload"]
)


@router.post("/statement")
async def upload_statement(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # --------------------------------------------------
    # 1. Validate file type
    # --------------------------------------------------

    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are supported currently."
        )

    # --------------------------------------------------
    # 2. Read uploaded file
    # --------------------------------------------------

    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty."
        )

    try:
        df = pd.read_csv(
            io.BytesIO(contents)
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to read CSV file: {str(e)}"
        )

    # --------------------------------------------------
    # 3. Validate required columns
    # --------------------------------------------------

    required_columns = [
        "date",
        "description",
        "amount"
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "CSV is missing required columns.",
                "missing_columns": missing_columns,
                "required_columns": required_columns
            }
        )

    # --------------------------------------------------
    # 4. Counters
    # --------------------------------------------------

    imported_count = 0
    duplicate_count = 0
    skipped_count = 0

    # --------------------------------------------------
    # 5. Process transactions
    # --------------------------------------------------

    for _, row in df.iterrows():

        try:
            # ------------------------------------------
            # Read basic values
            # ------------------------------------------

            description = str(
                row["description"]
            ).strip()

            if not description:
                skipped_count += 1
                continue

            transaction_date = pd.to_datetime(
                row["date"]
            ).date()

            amount = float(
                row["amount"]
            )

            # ------------------------------------------
            # Categorization
            # ------------------------------------------

            category = categorize_transaction(
                description
            )

            # ------------------------------------------
            # Income / Expense detection
            # ------------------------------------------

            transaction_type = detect_transaction_type(
                description
            )

            # ------------------------------------------
            # Duplicate check
            #
            # A transaction is considered duplicate when
            # date + description + amount + type + category
            # are exactly the same.
            # ------------------------------------------

            existing_transaction = (
                db.query(Transaction)
                .filter(
                    Transaction.date == transaction_date,
                    Transaction.description == description,
                    Transaction.amount == amount,
                    Transaction.transaction_type == transaction_type,
                    Transaction.category == category
                )
                .first()
            )

            if existing_transaction:
                duplicate_count += 1
                continue

            # ------------------------------------------
            # Create new transaction
            # ------------------------------------------

            transaction = Transaction(
                date=transaction_date,
                description=description,
                amount=amount,
                transaction_type=transaction_type,
                category=category,
                source=file.filename
            )

            db.add(transaction)

            imported_count += 1

        except Exception:
            skipped_count += 1
            continue

    # --------------------------------------------------
    # 6. Save new transactions
    # --------------------------------------------------

    db.commit()

    # --------------------------------------------------
    # 7. Response
    # --------------------------------------------------

    return {
        "status": "success",
        "filename": file.filename,
        "transactions_imported": imported_count,
        "duplicates_skipped": duplicate_count,
        "invalid_or_skipped": skipped_count,
        "message": (
            f"Upload completed. "
            f"{imported_count} new transactions imported, "
            f"{duplicate_count} duplicates skipped."
        )
    }