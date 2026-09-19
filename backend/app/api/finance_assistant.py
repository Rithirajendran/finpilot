from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.finance_assistant import (
    answer_finance_question
)


router = APIRouter(
    prefix="/api/ai",
    tags=["AI Assistant"]
)


class FinanceQuestion(BaseModel):
    question: str


@router.post("/ask")
def ask_finance_question(
    request: FinanceQuestion,
    db: Session = Depends(get_db)
):

    result = answer_finance_question(
        request.question,
        db
    )

    return {
        "question": request.question,
        "answer": result["answer"]
    }