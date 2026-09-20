from sqlalchemy import Column, Integer, String, Float, Date
from app.database import Base


class RecurringPayment(Base):
    __tablename__ = "recurring_payments"

    id = Column(Integer, primary_key=True, index=True)
    merchant = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    frequency = Column(String, nullable=False)
    next_expected_date = Column(Date, nullable=True)
    category = Column(String, nullable=True)