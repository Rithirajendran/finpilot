from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db

from app.services.financial_insights import (
    generate_financial_insights
)


router = APIRouter(
    prefix="/api/financial-insights",
    tags=["Financial Insights"]
)


@router.get("/")
def get_financial_insights(
    db: Session = Depends(get_db)
):

    insights = generate_financial_insights(
        db
    )

    return {
        "count": len(insights),
        "insights": insights
    }